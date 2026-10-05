import {aws,read,save,dir,prior} from './read-aws.mjs';
const validation=read(prior+'/validation.json'),inventory=read(prior+'/inventory.json');
const unresolved=validation.results.flatMap(j=>j.unresolved.map(r=>({...r,job:j.name,expected:j.expected})));
if(unresolved.length!==280)throw Error('Unexpected unresolved input');
function family(r){return r.resource.includes('/restapis/')?(r.resource.endsWith('/resources')?'rest-children':'rest-root'):r.resource.includes('%2Fstages')?'tag-encoded-stage':r.resource.includes('%3a')?'tag-lower-encoded-api':r.resource.includes('%3A')?'tag-encoded-api':'tag-decoded-api';}
const examples=new Map();for(const row of unresolved)if(!examples.has(family(row)))examples.set(family(row),row.resource);
const controls={};
await Promise.all([...examples].map(async([name,resource])=>{
 const request={PolicyInputList:[JSON.stringify({Version:'2012-10-17',Statement:[{Effect:'Allow',Action:'apigateway:*',Resource:'*'}]})],ActionNames:['apigateway:PATCH','apigateway:DELETE'],ResourceArns:[resource]};
 save('control-request-'+name,request);const result=await aws('iam','simulate-custom-policy','--cli-input-json','file://'+dir+'/control-request-'+name+'.json');save('control-response-'+name,result);
 controls[name]=Object.fromEntries(result.EvaluationResults.map(r=>[r.EvalActionName,{decision:r.EvalDecision,matched:r.MatchedStatements,missing:r.MissingContextValues}]));
}));
save('controls',controls);
const categories=['REQUIRED_LIVE_OPERATION','PROTECTED_NEGATIVE','SYNTHETIC_DUPLICATE','SIMULATOR_UNSUPPORTED','NOT_USED_BY_TEMPLATE','UNKNOWN'];
const cases=unresolved.map((r,index)=>{
 const f=family(r),isRest=f.startsWith('rest'),decoded=decodeURIComponent(r.resource);
 const apiId=decoded.match(/\/(?:restapis|apis)\/([a-z0-9]+)/)?.[1]??null;
 const protectedApi=inventory.apis.find(a=>a.id===apiId);
 const operation=isRest?(r.action.endsWith('PATCH')?'UpdateRestApi/UpdateResource':'DeleteRestApi/DeleteResource'):(r.action.endsWith('PATCH')?'TagResource/UntagResource IAM alias':'UntagResource');
 const control=controls[f][r.action];
 const unsupported=control.decision==='implicitDeny'&&!control.matched.length&&!control.missing.length;
 const own=apiId==='thproof123';
 const tagOnCreate=!isRest&&own&&r.action==='apigateway:PATCH';
 return {caseId:index+1,sourceJob:r.job,operation,httpControlPlaneOperation:isRest?(r.action.endsWith('PATCH')?'PATCH /restapis/{id}[/resources/{resourceId}]':'DELETE /restapis/{id}[/resources/{resourceId}]'):(r.action.endsWith('PATCH')?'TagResource POST /v2/tags/{resourceArn}; UntagResource DELETE /v2/tags/{resourceArn}':'UntagResource DELETE /v2/tags/{resourceArn}'),iamAction:r.action,resourcePath:r.resource,apiId,pathFamily:f,classification:unsupported?'SIMULATOR_UNSUPPORTED':'UNKNOWN',requiredByTeamHubTemplate:tagOnCreate,requiredDuringCreate:tagOnCreate,requiredDuringRollback:false,protectedNegative:!!protectedApi,protectedClassification:protectedApi?.classification??null,negativeControl:r.expected!=='allowed',simulatorSupported:!unsupported,secondarySemantics:isRest?'NOT_USED_BY_TEMPLATE':protectedApi?'PROTECTED_NEGATIVE':own?(tagOnCreate?'REQUIRED_LIVE_OPERATION':'NOT_USED_BY_TEMPLATE'):'SYNTHETIC_DUPLICATE',representationNote:isRest?'REST resources absent; collection /resources is a synthetic probe, not a Team resource':f==='tag-lower-encoded-api'?'Alternate percent-encoding representation; not an additional service operation':f==='tag-decoded-api'?'Decoded representation of the encoded tag ARN; not a separate required call':'Encoded tagging representation; provider schema declares tagging on API/Stage',evidence:[`control-response-${f}.json`,'schema-AWS-ApiGatewayV2-Api.json','schema-AWS-ApiGatewayV2-Stage.json','https://docs.aws.amazon.com/service-authorization/latest/reference/list_apigatewayv2.html','https://docs.aws.amazon.com/apigatewayv2/latest/api-reference/tags-resource-arn.html'],rollbackEvidence:'First-create cleanup deletes the owned API/Stage; standalone UntagResource is not declared by their delete handlers. Update/tag maintenance is a separate lifecycle.'};
});
const counts=Object.fromEntries(categories.map(c=>[c,cases.filter(r=>r.classification===c).length]));
save('classification',{original:280,counts,controlsTested:12,controlImplicitDenials:Object.values(controls).flatMap(Object.values).filter(r=>r.decision==='implicitDeny').length,protectedNegativeCases:cases.filter(r=>r.protectedNegative).length,cases});
console.log(JSON.stringify({counts,controlFamilies:examples.size,controls:12}));if(counts.UNKNOWN)process.exitCode=1;
