import {aws,read,save,digest,audit} from './final-read.mjs';
const identity=await aws('sts','get-caller-identity');if(identity.Account!=='058264289478')throw Error('Wrong account');
const prior=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/resolver-coverage.json');
const ids=new Set(prior.resolvers.flatMap(r=>r.pipeline?.functions??[]));
const functions=(await aws('appsync','list-functions','--api-id',prior.api)).functions.filter(f=>ids.has(f.functionId));
save('resolver-functions',{at:new Date().toISOString(),api:prior.api,functions:functions.map(f=>({id:f.functionId,name:f.name,dataSource:f.dataSourceName,request:f.requestMappingTemplate??f.code,responseDigest:digest(f.responseMappingTemplate??'')})),audit});
const bucket=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/logo-inventory.json').bucket;
try{const p=await aws('s3api','get-bucket-policy','--bucket',bucket);save('logo-resource-policy',{bucket,policy:JSON.parse(p.Policy),audit});}catch(e){save('logo-resource-policy',{bucket,error:e.message,audit});}
const ledger=read('docs/architecture/legacy-resource-ownership.json');
const tables=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/table-inventory.json').tables;
const proposals=[];
for(const t of tables){
 const row=ledger.resources.find(r=>r.resourceId===t.resourceId);
 const r=await aws('cloudformation','get-template','--stack-name',row.currentStack.arn,'--template-stage','Original');
 const template=typeof r.TemplateBody==='string'?JSON.parse(r.TemplateBody):r.TemplateBody;
 const current=template.Resources[row.logicalId];
 const proposed={...structuredClone(current),DeletionPolicy:'Retain',UpdateReplacePolicy:'Retain',Properties:{...structuredClone(current.Properties),pointInTimeRecoverySpecification:{pointInTimeRecoveryEnabled:true},deletionProtectionEnabled:true,allowDestructiveGraphqlSchemaUpdates:false,replaceTableUponGsiUpdate:false}};
 proposals.push({resourceId:row.resourceId,stack:row.currentStack.arn,physicalId:row.physicalId,templateDigest:digest(template),before:current,proposed,identityUnchanged:true});
}
save('legacy-protection-proposal',{status:'PROPOSAL_ONLY_NOT_APPLIED',proposals,audit});
console.log(JSON.stringify({pipelineFunctions:functions.length,protectionProposals:proposals.length,audit}));
