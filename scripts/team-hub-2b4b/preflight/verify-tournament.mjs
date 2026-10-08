import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='docs/architecture/team-hub-2b4b-evidence-2026-10-06';
const previous='docs/architecture/phase2a-tournament-runtime-kms-evidence-2026-10-04';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const issues=[];
const equal=(a,b,label)=>{if(JSON.stringify(stable(a))!==JSON.stringify(stable(b)))issues.push(label);};
function aws(...args){const allow={cloudformation:['describe-stacks','list-stack-resources'],iam:['get-role','get-policy','get-policy-version','list-role-policies','get-role-policy','list-attached-role-policies'],lambda:['get-function-configuration','get-policy'],apigatewayv2:['get-api','get-stages','get-authorizers','get-routes','get-integrations']};if(!allow[args[0]]?.includes(args[1]))throw Error('Read-only command required');return JSON.parse(execFileSync('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',maxBuffer:20e6,windowsHide:true}));}
const baseline=read(previous+'/live-resources.json'),securityBaseline=read(previous+'/security-installed.json');
const stack=aws('cloudformation','describe-stacks','--stack-name',baseline.stack.StackName).Stacks[0];
for(const key of ['StackId','StackStatus','LastUpdatedTime','DisableRollback','RoleARN'])equal(stack[key],baseline.stack[key],'stack '+key);
const resources=aws('cloudformation','list-stack-resources','--stack-name',stack.StackName).StackResourceSummaries.filter(r=>r.ResourceStatus!=='DELETE_COMPLETE');
const identities=rs=>rs.map(r=>({id:r.LogicalResourceId,type:r.ResourceType,physical:r.PhysicalResourceId})).sort((a,b)=>a.id.localeCompare(b.id));
equal(identities(resources),identities(baseline.resources),'resource identities');
const api=aws('apigatewayv2','get-api','--api-id','msipnwy39j');equal(api,baseline.api,'api');
const live={at:new Date().toISOString(),stack,resources,api};
for(const key of ['stages','authorizers','routes','integrations']){live[key]=aws('apigatewayv2','get-'+key,'--api-id','msipnwy39j').Items;equal(live[key],baseline[key],key);}
const f=aws('lambda','get-function-configuration','--function-name',baseline.lambda.name);
live.lambda={arn:f.FunctionArn,name:f.FunctionName,codeSha256:f.CodeSha256,state:f.State,revision:f.Environment?.Variables?.BUILD_REVISION,logging:f.LoggingConfig};equal(live.lambda,baseline.lambda,'lambda');
live.permission=JSON.parse(aws('lambda','get-policy','--function-name',f.FunctionName).Policy);equal(live.permission,baseline.permission,'lambda permission');
const security={};
for(const key of ['runtime','execution','deploy']){const policy=aws('iam','get-policy','--policy-arn',securityBaseline[key].policy.Arn).Policy;const document=aws('iam','get-policy-version','--policy-arn',policy.Arn,'--version-id',policy.DefaultVersionId).PolicyVersion.Document;security[key]={policy,document};equal(security[key],securityBaseline[key],key+' managed policy');}
security.role=aws('iam','get-role','--role-name',securityBaseline.role.RoleName).Role;delete security.role.RoleLastUsed;equal(security.role,securityBaseline.role,'runtime role');
const names=aws('iam','list-role-policies','--role-name',security.role.RoleName).PolicyNames;if(names.length!==1)issues.push('runtime inline policy count');
security.inline=names.length===1?aws('iam','get-role-policy','--role-name',security.role.RoleName,'--policy-name',names[0]).PolicyDocument:null;equal(security.inline,securityBaseline.inline,'runtime inline policy');
security.attached=aws('iam','list-attached-role-policies','--role-name',security.role.RoleName).AttachedPolicies;if(security.attached.length)issues.push('unexpected runtime attached policies');
fs.writeFileSync(dir+'/tournament-baseline.json',JSON.stringify({live,security,issues},null,2)+'\n');
console.log(JSON.stringify({status:stack.StackStatus,count:resources.length,api:api.ApiId,issues}));if(issues.length)process.exitCode=1;


