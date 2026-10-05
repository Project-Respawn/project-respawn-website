import fs from 'node:fs';
import crypto from 'node:crypto';
import {executionPolicy,callerPolicy,fixtureApiId,target} from './model.mjs';
const out='docs/architecture/team-hub-2b2-security-correction-evidence-2026-10-05';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const receipt=read('infrastructure/domains/team-hub/.build/offline-1791205212119/receipt.json');
if(receipt.revision!=='d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f'||receipt.templates[0].sha256!=='0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee'||receipt.templates[1].sha256!=='fd5aef33eef19e600fbc8e892facff2605c0286cf215156f1b2d34e842e33998'||receipt.closure[0].outputs[0].sha256!=='0e3fde08f1dbf3c1803ff1daac65e902117d757c76506d478112d5291814e7b3')throw Error('Authoritative candidate pins changed');
for(const x of [...receipt.inputs,...receipt.templates,...receipt.closure.flatMap(c=>c.outputs)])if(hash(x.path)!==x.sha256)throw Error('Original candidate changed: '+x.path);
const original=read(receipt.templates[1].path),product=receipt.templates[0];
const inventory=read(out+'/inventory.json');
if(inventory.identity.Account!==target.account||inventory.region!==target.region||inventory.teamStacks.length||inventory.apis.some(a=>a.suspectedTeam))throw Error('Inventory target/absence failed');
const base=original.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument;
// Fixed expiry is part of this review candidate. Renewal requires a new review hash.
const expiresAt=new Date(Date.parse(inventory.at)+24*60*60*1000).toISOString();
const bootstrap=executionPolicy(base,{state:'FIRST_CREATE',protectedIds:inventory.protectedIds,expiresAt});
const steady=executionPolicy(base,{state:'STEADY_STATE',protectedIds:inventory.protectedIds,apiId:fixtureApiId});
const caller=callerPolicy(product.sha256);
const files=[];
function save(name,value){const path=out+'/'+name;fs.writeFileSync(path,JSON.stringify(value,null,2)+'\n');files.push({path,sha256:hash(path)});}
for(const [name,p] of [['first-create-policy.json',bootstrap],['steady-state-fixture-policy.json',steady],['deployment-caller-policy.json',caller]]){
  if(JSON.stringify(p).length>6144)throw Error(name+' exceeds managed policy quota: '+JSON.stringify(p).length);
  save(name,p);
}
function template(policy){const t=structuredClone(original);t.Resources.ExecutionBoundary.Properties.PolicyDocument=policy;t.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument=policy;t.Resources.PreparationCaller.Properties.PolicyDocument=caller;return t;}
save('first-create-security.template.json',template(bootstrap));
const steadyTemplate=template(steady);
steadyTemplate.Parameters={...(steadyTemplate.Parameters??{}),TeamHubApiId:{Type:'String',AllowedPattern:'[a-z0-9]{8,12}',Description:'Verified physical HttpApi ID from ProjectRespawn-TeamHub-Ntgre; never a simulation fixture'}};
function parameterize(v){if(typeof v==='string'&&v.includes(fixtureApiId))return {'Fn::Sub':v.replaceAll(fixtureApiId,'${TeamHubApiId}')};if(Array.isArray(v))return v.map(parameterize);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,parameterize(x)]));return v;}
save('steady-state-security.template.json',parameterize(steadyTemplate));
for(const p of ['model.mjs','build.mjs','inventory.mjs','aws-read.mjs','validate.mjs','bind-steady-state.mjs','security.test.mjs','README.md']){const path='infrastructure/security/team-hub-Ntgre-deployment-v2/'+p;files.push({path,sha256:hash(path)});}
files.push({path:out+'/inventory.json',sha256:hash(out+'/inventory.json')});
const revision=crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex');
save('manifest.json',{revision,target,createdAt:new Date().toISOString(),expiresAt,productRevision:receipt.revision,productTemplate:product,originalSecurityTemplate:receipt.templates[1],runtimeUnchanged:JSON.stringify(original.Resources.PreviewBoundary)===JSON.stringify(template(bootstrap).Resources.PreviewBoundary),sourceInputsUnchanged:receipt.inputs.length,lambda:receipt.closure[0].outputs,files:[...files],securityResources:4,productResources:11,steadyStateRequiresVerifiedApiId:true,awsWrites:0});
console.log(JSON.stringify({revision,expiresAt,policyBytes:{bootstrap:JSON.stringify(bootstrap).length,steady:JSON.stringify(steady).length,caller:JSON.stringify(caller).length},productUnchanged:true}));
