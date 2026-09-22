import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { accountAssembly, evaluate, state, BUDGETS, compareCounts, baselineDigest } from './lib/cloudformation-accounting.mjs';
import { infrastructureInputs } from './lib/infrastructure-inputs.mjs';
import { mkdirSync } from 'node:fs';

function fixture(t, rootResources = {}, extras = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'respawn-count-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ artifacts: { Root: { type: 'aws:cloudformation:stack', properties: { templateFile: 'root.json' } } } }));
  writeFileSync(join(dir, 'root.json'), JSON.stringify({ Resources: rootResources }));
  for (const [name, value] of Object.entries(extras)) writeFileSync(join(dir, name), JSON.stringify(value));
  return dir;
}
const nested = file => ({ Type: 'AWS::CloudFormation::Stack', Metadata: { 'aws:asset:path': file } });
const resources = n => Object.fromEntries(Array.from({ length: n }, (_,i) => [`R${i}`, { Type: 'AWS::AppSync::Resolver' }]));
test('counts nested handles and all descendants; ignores stale unreferenced templates', t => {
  const dir = fixture(t, { Child: nested('child.json') }, { 'child.json': { Resources: resources(4) }, 'stale.template.json': { Resources: resources(900) } });
  const r = accountAssembly(dir); assert.equal(r.total,5); assert.equal(r.nestedResources,4); assert.equal(r.templateInstances,2); assert.equal(r.types['AWS::AppSync::Resolver'],4);
});
test('same template instantiated twice contributes twice', t => {
  const r = accountAssembly(fixture(t, { A: nested('child.json'), B: nested('child.json') }, { 'child.json': { Resources: resources(4) } }));
  assert.equal(r.total,10); assert.equal(r.templateInstances,3);
});
test('missing nested metadata fails closed', t => assert.throws(() => accountAssembly(fixture(t, { Bad: { Type: 'AWS::CloudFormation::Stack' } })), /Missing local nested/));
test('missing nested file fails closed', t => assert.throws(() => accountAssembly(fixture(t, { Bad: nested('absent.json') }))));
test('nested cycles fail closed', t => assert.throws(() => accountAssembly(fixture(t, { Bad: nested('root.json') })), /cycle/));
test('multiple roots require explicit selection', t => {
  const dir=fixture(t,resources(1));writeFileSync(join(dir,'manifest.json'),JSON.stringify({artifacts:{A:{type:'aws:cloudformation:stack',properties:{templateFile:'root.json'}},B:{type:'aws:cloudformation:stack',properties:{templateFile:'root.json'}}}}));
  assert.throws(()=>accountAssembly(dir),/Select --root/);assert.equal(accountAssembly(dir,'A').total,1);assert.throws(()=>accountAssembly(dir,'C'),/Root not found/);
});
for(const [count,expected] of [[250,'NORMAL'],[251,'WARNING'],[350,'WARNING'],[351,'ACTION REQUIRED'],[480,'ACTION REQUIRED'],[481,'HARD LIMIT / BLOCKED'],[501,'HARD LIMIT / BLOCKED']]) test(`template threshold ${count}`,()=>assert.equal(state(count,BUDGETS.template),expected));
for(const [count,expected] of [[1000,'NORMAL'],[1001,'WARNING'],[1800,'WARNING'],[1801,'ACTION REQUIRED'],[2500,'ACTION REQUIRED'],[2501,'HARD LIMIT / BLOCKED']]) test(`hierarchy threshold ${count}`,()=>assert.equal(state(count,BUDGETS.hierarchy),expected));
function large(t) {return accountAssembly(fixture(t,Object.fromEntries(Array.from({length:11},(_,i)=>[`Child${i}`,nested('child.json')])),{'child.json':{Resources:resources(240)}}));}
test('small individual templates do not hide root creation failure',t=>{const r=large(t);assert.equal(r.largest,240);assert.equal(r.total,2651);assert.equal(evaluate(r).passed,false);});
test('bounded legacy debt allows only non-growing updates, not creates or new stack contributions',t=>{
  const r=large(t),exception={roots:['Root'],expiresAt:'2026-10-21',owner:'Platform',milestone:'Decompose root',baselineTotal:r.total};
  const opts={baseline:r,exception,operation:'update',now:new Date('2026-09-21')};
  assert.equal(baselineDigest(JSON.stringify(r)),baselineDigest(JSON.stringify(r,null,2).replaceAll('\n','\r\n')+'\r\n'));
  assert.equal(evaluate(r,opts).passed,true);assert.equal(evaluate(r,{...opts,operation:'create'}).passed,false);
  assert.equal(evaluate({...r,total:r.total+1},opts).passed,false);
  assert.equal(evaluate(r,{...opts,now:new Date('2026-11-01')}).passed,false);
  assert.equal(evaluate({...r,root:'Other'},opts).passed,false);
  assert.equal(evaluate({...r,stacks:[...r.stacks,{path:'new',resources:1}]},opts).passed,false);
});
test('module deltas expose growth even when total decreases',t=>{
  const a=accountAssembly(fixture(t,resources(50))),b={...a,total:49,modules:{...a.modules,'Esports / Team Hub':18}};
  assert.equal(compareCounts(a,b).modules['Esports / Team Hub'].delta,18);assert.equal(evaluate(b,{baseline:a}).passed,false);
});
test('frontend changes do not trigger backend accounting, but backend config changes do',t=>{
 const dir=fixture(t);for(const p of ['package.json','package-lock.json','amplify.yml'])writeFileSync(join(dir,p),'{}');
 mkdirSync(join(dir,'src'));writeFileSync(join(dir,'src','page.vue'),'<p>before</p>');
 mkdirSync(join(dir,'amplify','config'),{recursive:true});writeFileSync(join(dir,'amplify','config','permissions.json'),'{}');
 const a=infrastructureInputs(dir).sha256;writeFileSync(join(dir,'src','page.vue'),'<p>after</p>');assert.equal(infrastructureInputs(dir).sha256,a);
 writeFileSync(join(dir,'amplify','config','permissions.json'),'{"new":true}');assert.notEqual(infrastructureInputs(dir).sha256,a);
});
test('nested assets outside the assembly are rejected',t=>{
 const outer=fixture(t),dir=join(outer,'assembly');mkdirSync(dir);writeFileSync(join(dir,'manifest.json'),JSON.stringify({artifacts:{Root:{type:'aws:cloudformation:stack',properties:{templateFile:'root.json'}}}}));
 writeFileSync(join(dir,'root.json'),JSON.stringify({Resources:{Bad:nested('../root.json')}}));assert.throws(()=>accountAssembly(dir),/escapes/);
});
