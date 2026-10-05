import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {read,save,dir,previous} from './read-aws.mjs';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const old=read(previous+'/manifest.json');assert.equal(old.revision,'7e3f27a0191d5039f3035a4fddd0e14f10eb9c56fd41a8a13092ca5b4d14768b');
for(const f of old.files)assert.equal(hash(f.path),f.sha256,'Previous security changed: '+f.path);
const receipt=read('infrastructure/domains/team-hub/.build/offline-1791205212119/receipt.json');assert.equal(receipt.revision,'d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f');
for(const f of [...receipt.inputs,...receipt.templates,...receipt.closure.flatMap(c=>c.outputs)])assert.equal(hash(f.path),f.sha256,'Product changed: '+f.path);
function correct(policy){const p=structuredClone(policy);const statements=p.Statement.filter(s=>s.Effect==='Deny'&&Array.isArray(s.Action)&&s.Action.includes('kms:*')&&s.Resource==='*');assert.equal(statements.length,1,'Exactly one execution KMS deny expected');statements[0].Action=statements[0].Action.filter(a=>a!=='kms:*');assert.ok(!p.Statement.some(s=>s.Effect==='Allow'&&(s.NotAction||[].concat(s.Action??[]).some(a=>a==='*'||a.toLowerCase().startsWith('kms:')))),'No KMS allow permitted');return p;}
function diff(a,b,path=''){if(JSON.stringify(a)===JSON.stringify(b))return [];if(Array.isArray(a)&&Array.isArray(b))return Array.from({length:Math.max(a.length,b.length)},(_,i)=>diff(a[i],b[i],path+'/'+i)).flat();if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diff(a[k],b[k],path+'/'+k));return [{path,before:a,after:b??null}];}
const artifacts=[],changes=[];
for(const name of ['first-create-policy','steady-state-fixture-policy','first-create-security.template','steady-state-security.template']){
 const original=read(previous+'/'+name+'.json');let changed;
 if(name.includes('.template')){changed=structuredClone(original);changed.Resources.ExecutionBoundary.Properties.PolicyDocument=correct(changed.Resources.ExecutionBoundary.Properties.PolicyDocument);changed.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument=correct(changed.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument);assert.deepEqual(changed.Resources.PreviewBoundary,original.Resources.PreviewBoundary);assert.deepEqual(changed.Resources.PreparationCaller,original.Resources.PreparationCaller);}
 else changed=correct(original);
 const semantic=diff(original,changed);assert.equal(semantic.length,name.includes('.template')?2:1);assert.ok(semantic.every(d=>d.before==='kms:*'&&d.after===null&&/\/Statement\/\d+\/Action\/\d+$/.test(d.path)),'Additional change prohibited');
 save(name,changed);artifacts.push({path:dir+'/'+name+'.json',sha256:hash(dir+'/'+name+'.json')});changes.push({document:name,changes:semantic});
}
fs.copyFileSync(previous+'/deployment-caller-policy.json',dir+'/deployment-caller-policy.json');artifacts.push({path:dir+'/deployment-caller-policy.json',sha256:hash(dir+'/deployment-caller-policy.json')});
save('semantic-diff',{previousRevision:old.revision,change:'Remove only kms:* from execution Deny action list in identity/boundary for both deployment states',kmsAllowsAdded:0,runtimeChanged:false,callerChanged:false,expiryChanged:false,apiPermissionsChanged:false,changes});
const source='infrastructure/security/team-hub-Ntgre-kms-corrected';
const sources=fs.readdirSync(source).filter(n=>/\.(mjs|md)$/.test(n)).sort().map(n=>({path:source+'/'+n,sha256:hash(source+'/'+n)}));
const revision=crypto.createHash('sha256').update(JSON.stringify({previous:old.revision,product:receipt.revision,artifacts,sources})).digest('hex');
save('manifest',{revision,previousRevision:old.revision,productRevision:receipt.revision,productTemplate:old.productTemplate,target:old.target,expiresAt:old.expiresAt,createdAt:new Date().toISOString(),artifacts,sources,productSourceInputs:54,securityResources:4,kmsAllowsAdded:0,awsWrites:0});
console.log(JSON.stringify({revision,firstCreateTemplateSha:artifacts.find(a=>a.path.endsWith('first-create-security.template.json')).sha256,kmsAllowsAdded:0,semanticChanges:changes.map(d=>({document:d.document,count:d.changes.length}))}));
