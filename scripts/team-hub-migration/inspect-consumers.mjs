import assert from 'node:assert/strict';
import {aws,read,save,digest,audit} from './read-only.mjs';
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const baseline=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/legacy-after.json');
const inventory=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/table-inventory.json');
const fn=baseline.lambdas.find(f=>f.arn.includes('myFunctionrebuild'));assert.ok(fn);
const config=await aws('lambda','get-function-configuration','--function-name',fn.arn);
const roleName=config.Role.split('/').at(-1);
const role=(await aws('iam','get-role','--role-name',roleName)).Role;
const policyDocuments=[];
for(const name of (await aws('iam','list-role-policies','--role-name',roleName)).PolicyNames){const p=await aws('iam','get-role-policy','--role-name',roleName,'--policy-name',name);policyDocuments.push({name,document:p.PolicyDocument});}
for(const p of (await aws('iam','list-attached-role-policies','--role-name',roleName)).AttachedPolicies){const v=(await aws('iam','get-policy','--policy-arn',p.PolicyArn)).Policy;const d=(await aws('iam','get-policy-version','--policy-arn',p.PolicyArn,'--version-id',v.DefaultVersionId)).PolicyVersion.Document;policyDocuments.push({name:p.PolicyName,document:d});}
const relevant=[];for(const p of policyDocuments)for(const s of p.document.Statement??[])if(JSON.stringify(s).includes('team-logos/')||inventory.tables.some(t=>JSON.stringify(s).includes(t.table.TableName))||JSON.stringify(s).includes('appsync:GraphQL'))relevant.push({policy:p.name,statement:s});
const streams=[];for(const t of inventory.tables){const mappings=await aws('lambda','list-event-source-mappings','--event-source-arn',t.table.LatestStreamArn);streams.push({model:t.model,mappings:(mappings.EventSourceMappings??[]).map(m=>({uuid:m.UUID,functionArn:m.FunctionArn,state:m.State,eventSourceArn:m.EventSourceArn}))});}
const rules=await aws('events','list-rule-names-by-target','--target-arn',fn.arn);
const tablePolicies=[];for(const t of inventory.tables)try{const p=await aws('dynamodb','get-resource-policy','--resource-arn',t.table.TableArn);tablePolicies.push({model:t.model,present:true,policy:JSON.parse(p.Policy)});}catch(e){if(!e.message.includes('PolicyNotFoundException'))throw e;tablePolicies.push({model:t.model,present:false});}
save('live-consumers',{at:new Date().toISOString(),identity,lambda:fn.arn,role:{arn:role.Arn,trust:role.AssumeRolePolicyDocument,boundary:role.PermissionsBoundary??null},policyDigests:policyDocuments.map(p=>({name:p.name,digest:digest(p.document)})),relevantStatements:relevant,tableEnvironment:Object.fromEntries(Object.entries(config.Environment?.Variables??{}).filter(([k])=>/^TEAM_HUB_(TEAM|MEMBERSHIP|ROSTER)_TABLE$/.test(k))),streams,eventBridgeDefaultBusRules:rules.RuleNames,tablePolicies,limitations:['EventBridge check covers default event bus, not every external scheduler/client.','Shared Lambda permissions are not a complete account-wide principal/session/data-event audit.','No production stacks or business data inspected.'],audit});
console.log(JSON.stringify({role:roleName,relevantStatements:relevant.length,streamMappings:streams.reduce((n,s)=>n+s.mappings.length,0),defaultBusRules:rules.RuleNames.length,tablePolicies:tablePolicies.filter(t=>t.present).length,audit}));
