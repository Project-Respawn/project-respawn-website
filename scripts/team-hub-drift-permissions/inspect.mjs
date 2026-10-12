import assert from 'node:assert/strict';
import {aws,read,save,canonical} from './aws.mjs';
const stack='ProjectRespawn-TeamHub-Ntgre', r={at:new Date().toISOString(),awsResourceWrites:0,functions:[],complete:false};
r.identity=await aws('sts','get-caller-identity');assert.equal(r.identity.Account,'058264289478');
r.stacks=[];for(const name of [stack,stack+'-ReadProofSecurity']){const s=(await aws('cloudformation','describe-stacks',{StackName:name})).Stacks[0];assert.equal(s.StackStatus,'UPDATE_COMPLETE');r.stacks.push({name,status:s.StackStatus,updated:s.LastUpdatedTime});}
r.desired=(await aws('cloudformation','get-template',{StackName:stack,TemplateStage:'Original'})).TemplateBody;if(typeof r.desired==='string')r.desired=JSON.parse(r.desired);
assert.equal(canonical(r.desired),canonical(read('docs/architecture/team-hub-cursor-security-evidence-2026-10-08/product.template.json')));
const proposal=read('docs/architecture/team-hub-config-repair-evidence-2026-10-09/product.template.json');
for(const id of ['ParityRead','ParityCommand']){
 const logical=Object.keys(r.desired.Resources).find(k=>r.desired.Resources[k].Type==='AWS::Lambda::Function'&&r.desired.Resources[k].Properties.FunctionName===stack+'-'+id);assert.ok(logical);
 const f=await aws('lambda','get-function-configuration',{FunctionName:stack+'-'+id});
 const hash=Buffer.from(f.CodeSha256,'base64').toString('hex');assert.equal(hash,'da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e');
 const desired=r.desired.Resources[logical].Properties.Environment.Variables,proposed=proposal.Resources[logical].Properties.Environment.Variables,actual=f.Environment?.Variables??{};
 const entry={logical,name:f.FunctionName,arn:f.FunctionArn,role:f.Role,state:f.State,lastUpdateStatus:f.LastUpdateStatus,lastModified:f.LastModified,runtimeSha256:hash,environmentError:f.Environment?.Error??null,actual,desired,proposed,missing:Object.keys(desired).filter(k=>!(k in actual)),coreJsonSemanticallyEqual:canonical(JSON.parse(desired.CORE_ENVIRONMENT))===canonical(JSON.parse(proposed.CORE_ENVIRONMENT)),coreStringEqual:desired.CORE_ENVIRONMENT===proposed.CORE_ENVIRONMENT};
 try{entry.drift=await aws('cloudformation','detect-stack-resource-drift',{StackName:stack,LogicalResourceId:logical});}catch(e){entry.driftUnavailable=String(e);}
 r.functions.push(entry);save('inspection',r);
}
try{const t=await aws('cloudformation','describe-type',{Type:'RESOURCE',TypeName:'AWS::Lambda::Function'});const s=JSON.parse(t.Schema);r.providerSchema={arn:t.Arn,version:t.DefaultVersionId,propertyTransform:s.propertyTransform,writeOnlyProperties:s.writeOnlyProperties,readPermissions:s.handlers?.read?.permissions};}catch(e){r.providerUnavailable=String(e);}
let next;r.events=[];do{const out=await aws('cloudformation','describe-stack-events',{StackName:stack,...(next?{NextToken:next}:{})});r.events.push(...out.StackEvents.filter(e=>e.Timestamp>='2026-10-08').map(({Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason,ClientRequestToken})=>({Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason,ClientRequestToken})));next=out.NextToken;if(out.StackEvents.some(e=>e.Timestamp<'2026-10-08'))break;}while(next);
r.complete=true;save('inspection',r);console.log(JSON.stringify({complete:true,functions:r.functions.map(f=>({logical:f.logical,missing:f.missing,drift:f.drift?.StackResourceDrift?.StackResourceDriftStatus,error:f.driftUnavailable})),events:r.events.length}));
