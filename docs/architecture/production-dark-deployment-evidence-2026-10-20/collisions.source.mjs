// Read-only collision check for all explicitly named new production resources.
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';const out="docs/architecture/production-dark-deployment-evidence-2026-10-20";
const m=JSON.parse(fs.readFileSync(out+'/manifest.json')),rows=[];
const aws=(service,action,input)=>JSON.parse(execFileSync('aws',[service,action,'--cli-input-json',JSON.stringify(input),'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}));
for(const a of Object.values({...m.products,...m.security}))for(const[id,r]of Object.entries(JSON.parse(fs.readFileSync(a.path)).Resources)){
 const p=r.Properties;let op;
 if(r.Type==='AWS::IAM::Role')op=['iam','get-role',{RoleName:p.RoleName}];
 if(r.Type==='AWS::IAM::ManagedPolicy')op=['iam','get-policy',{PolicyArn:'arn:aws:iam::058264289478:policy/'+p.ManagedPolicyName}];
 if(r.Type==='AWS::Lambda::Function')op=['lambda','get-function-configuration',{FunctionName:p.FunctionName}];
 if(r.Type==='AWS::SecretsManager::Secret')op=['secretsmanager','describe-secret',{SecretId:p.Name}];
 if(r.Type==='AWS::DynamoDB::Table')op=['dynamodb','describe-table',{TableName:p.TableName}];
 if(r.Type==='AWS::Logs::LogGroup'){const z=aws('logs','describe-log-groups',{logGroupNamePrefix:p.LogGroupName});assert.ok(!z.logGroups.some(g=>g.logGroupName===p.LogGroupName),'LOG_COLLISION');rows.push({id,name:p.LogGroupName,absent:true});continue;}
 if(r.Type==='AWS::ApiGatewayV2::Api'){const z=aws('apigatewayv2','get-apis',{});assert.ok(!z.Items.some(g=>g.Name===p.Name),'API_COLLISION');rows.push({id,name:p.Name,absent:true});continue;}
 if(!op)continue;
 let absent=false;try{aws(...op);}catch(e){if(/NoSuchEntity|ResourceNotFoundException|ResourceNotFound/.test(String(e.stderr)))absent=true;else throw e;}assert.ok(absent,'RESOURCE_NAME_COLLISION '+id);rows.push({id,request:op[2],absent:true});
}
const result={at:new Date().toISOString(),checks:rows,passed:true,awsWrites:0};fs.writeFileSync(out+'/collisions.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({checks:rows.length,passed:true,awsWrites:0}));
