import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile),dir='docs/architecture/team-hub-2b2-live-evidence-2026-10-05';
async function aws(...args){const allow={sts:['get-caller-identity'],iam:['simulate-custom-policy','list-roles','get-role'],accessanalyzer:['validate-policy'],apigatewayv2:['get-apis']};if(!allow[args[0]]?.includes(args[1]))throw Error('Read-only command required');const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{maxBuffer:20e6,windowsHide:true});return JSON.parse(stdout);}
const save=(n,v)=>fs.writeFileSync(dir+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
const identity=await aws('sts','get-caller-identity');if(identity.Account!=='058264289478'||identity.Arn!=='arn:aws:iam::058264289478:user/RavenTest')throw Error('Unexpected identity');save('identity',identity);
const apis=(await aws('apigatewayv2','get-apis')).Items;save('api-inventory',apis);
const roles=(await aws('iam','list-roles')).Roles.filter(r=>/TeamHub|team-hub/.test(r.RoleName));const detailed=[];for(const role of roles)detailed.push((await aws('iam','get-role','--role-name',role.RoleName)).Role);save('existing-team-named-roles',detailed);
const analyzer={};for(const name of ['PreviewBoundary','ExecutionBoundary','ExecutionIdentity','PreparationCaller']){analyzer[name]=await aws('accessanalyzer','validate-policy','--policy-type','IDENTITY_POLICY','--policy-document','file://'+dir+'/'+name+'.json');}save('access-analyzer',analyzer);
const arns=apis.flatMap(a=>[`arn:aws:apigateway:eu-north-1::/apis/${a.ApiId}`,`arn:aws:apigateway:eu-north-1::/apis/${a.ApiId}/routes/test-review-only`]);
save('simulation-request',{PolicyInputList:[fs.readFileSync(dir+'/ExecutionIdentity.json','utf8')],PermissionsBoundaryPolicyInputList:[fs.readFileSync(dir+'/ExecutionBoundary.json','utf8')],ActionNames:['apigateway:DELETE','apigateway:PATCH'],ResourceArns:arns,ContextEntries:[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'}]});
const simulation=await aws('iam','simulate-custom-policy','--cli-input-json','file://'+dir+'/simulation-request.json');save('protected-api-simulation',simulation);
// API Gateway aggregates multiple paths into one top-level result. Inspect each path.
const results=simulation.EvaluationResults.flatMap(e=>e.ResourceSpecificResults.map(r=>({...r,EvalActionName:e.EvalActionName})));
const failures=results.filter(r=>r.EvalResourceDecision==='allowed');
const findings=Object.entries(analyzer).flatMap(([policy,r])=>r.findings.map(f=>({policy,...f})));
const summary={at:new Date().toISOString(),identity,apiCount:apis.length,simulated:results.length,allowedMutations:failures.map(r=>({action:r.EvalActionName,resource:r.EvalResourceName,decision:r.EvalResourceDecision})),analyzerCounts:Object.fromEntries(['ERROR','SECURITY_WARNING','WARNING','SUGGESTION'].map(t=>[t,findings.filter(f=>f.findingType===t).length])),awsWrites:0,ready:false};save('security-review-summary',summary);console.log(JSON.stringify(summary));
