import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { verifyPinnedUpdate, treeDigest, sha256 } from './lib/pinned-update-allowance.mjs';
import { accountAssembly, evaluate } from './lib/cloudformation-accounting.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ntgre-allowance-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
  const resources = n => Object.fromEntries(Array.from({length:n},(_,i)=>['R'+i,{Type:'AWS::AppSync::FunctionConfiguration'}]));
  const candidateDirectory = path.join(root,'source'); fs.mkdirSync(candidateDirectory);
  fs.writeFileSync(path.join(candidateDirectory,'source.txt'),'accepted source');
  const manifestPath = path.join(root,'source-manifest.json');
  write(manifestPath,{files:[{file:'source.txt',sha256:sha256('accepted source')}]});
  for (const [name,count] of [['baseline',475],['candidate',167]]) {
    const dir=path.join(root,name);fs.mkdirSync(dir);
    write(path.join(dir,'manifest.json'),{artifacts:{Ntgre:{type:'aws:cloudformation:stack',properties:{templateFile:'root.json'}}}});
    const r=resources(5);
    for(const child of ['FunctionDirectiveStack',...Array.from({length:6},(_,i)=>'Child'+i)]) {
      r[child]={Type:'AWS::CloudFormation::Stack',Metadata:{'aws:asset:path':child+'.json'}};
      write(path.join(dir,child+'.json'),{Resources:resources(child==='FunctionDirectiveStack'?count:407)});
    }
    write(path.join(dir,'root.json'),{Resources:r});
  }
  const baselineAssembly=path.join(root,'baseline'),candidateAssembly=path.join(root,'candidate');
  write(path.join(root,'live-to-candidate.json'),{summary:{actions:{ADD:0,MODIFY:81,DELETE:308}}});
  const allowance={kind:'pinned-phase1-update',account:'123',region:'eu-north-1',environment:'Ntgre',roots:['Ntgre'],owner:'Platform',milestone:'Remove after proof',issuedAt:'2026-09-23T00:00:00Z',expiresAt:'2026-10-07T00:00:00Z',baselineTotal:2929,maximumCandidateTotal:2621,sourceFiles:1,candidateManifestSha256:sha256(fs.readFileSync(manifestPath)),baselineAssemblySha256:treeDigest(baselineAssembly),candidateAssemblySha256:treeDigest(candidateAssembly),evidence:{'live-to-candidate.json':sha256(fs.readFileSync(path.join(root,'live-to-candidate.json')))}};
  return {allowance,candidateDirectory,baselineAssembly,candidateAssembly,manifestPath,evidenceDirectory:root,account:'123',region:'eu-north-1',environment:'Ntgre',now:new Date('2026-09-24')};
}
test('exact pinned update passes with debt; direct generic bypass fails',t=>{
  const o=fixture(t),r=verifyPinnedUpdate(o);assert.equal(r.result.passed,true);assert.equal(r.report.total,2621);assert.equal(r.report.contributors.FunctionDirectiveStack,167);assert.equal(r.freshCreate,'BLOCKED');
  assert.equal(evaluate(r.report,{baseline:accountAssembly(o.baselineAssembly),exception:o.allowance,operation:'update',now:o.now}).passed,false);
});
for(const [name,mutate,pattern] of [
  ['fresh creation',o=>o.operation='create',/Fresh creation/],
  ['expired allowance',o=>o.now=new Date('2026-10-07'),/expired/],
  ['wrong account',o=>o.account='other',/Target/],
  ['wrong region',o=>o.region='us-east-1',/Target/],
  ['another environment',o=>o.environment='master',/Target/],
  ['different manifest',o=>fs.appendFileSync(o.manifestPath,' '),/manifest mismatch/],
  ['changed source',o=>fs.writeFileSync(path.join(o.candidateDirectory,'source.txt'),'SWG change'),/source mismatch/],
  ['changed accepted action evidence',o=>fs.appendFileSync(path.join(o.evidenceDirectory,'live-to-candidate.json'),' '),/evidence mismatch/],
  ['renewal beyond 14 days',o=>o.allowance.expiresAt='2026-10-08',/14 days/],
]) test(`rejects ${name}`,t=>{const o=fixture(t);mutate(o);assert.throws(()=>verifyPinnedUpdate(o),pattern);});

for(const [name,edit] of [
  ['2622 resources',r=>r.Resources.Added={Type:'AWS::IAM::Role'}],
  ['resource growth',r=>{for(let i=0;i<309;i++)r.Resources['Extra'+i]={Type:'AWS::IAM::Role'};}],
  ['added stack',r=>r.Resources.NewStack={Type:'AWS::CloudFormation::Stack',Metadata:{'aws:asset:path':'Child0.json'}}],
  ['protected replacement',r=>r.Resources.R0={Type:'AWS::Cognito::UserPool',Properties:{UserPoolName:'replacement'}}],
  ['unrelated same-count infrastructure change',r=>r.Resources.R0.Properties={Description:'unreviewed'}],
]) test(`rejects ${name} without repinning review`,t=>{const o=fixture(t),p=path.join(o.candidateAssembly,'root.json'),r=JSON.parse(fs.readFileSync(p));edit(r);fs.writeFileSync(p,JSON.stringify(r));assert.throws(()=>verifyPinnedUpdate(o),/Candidate assembly mismatch/);});
test('different root is rejected even with a matching assembly digest',t=>{
  const o=fixture(t),p=path.join(o.candidateAssembly,'manifest.json'),m=JSON.parse(fs.readFileSync(p));m.artifacts.Other=m.artifacts.Ntgre;delete m.artifacts.Ntgre;fs.writeFileSync(p,JSON.stringify(m));o.allowance.candidateAssemblySha256=treeDigest(o.candidateAssembly);assert.throws(()=>verifyPinnedUpdate(o),/Root mismatch/);
});
test('2622 ceiling is enforced independently of exact artifact pin',t=>{
  const o=fixture(t),p=path.join(o.candidateAssembly,'root.json'),m=JSON.parse(fs.readFileSync(p));m.Resources.Extra={Type:'AWS::IAM::Role'};fs.writeFileSync(p,JSON.stringify(m));o.allowance.candidateAssemblySha256=treeDigest(o.candidateAssembly);assert.throws(()=>verifyPinnedUpdate(o),/ceiling/);
});
