import fs from 'node:fs';import assert from 'node:assert/strict';
import {aws} from '../team-hub-describekey-execution/aws.mjs';import {flatten} from '../migration/iam-validation.mjs';
const E='docs/architecture/team-hub-isolated-verification-evidence-2026-10-12';
const template=JSON.parse(fs.readFileSync(E+'/isolated.template.json'));
const start=new Date(),end=new Date(start.getTime()+3600000);
const policy=JSON.parse(JSON.stringify(template.Resources.IsolatedRunner.Properties.Policies[0].PolicyDocument).replaceAll('{"Ref":"NotBefore"}',JSON.stringify(start.toISOString())).replaceAll('{"Ref":"ExpiresAt"}',JSON.stringify(end.toISOString())));
const report={at:start.toISOString(),simulationWindowOnly:{start,end},analyzer:await aws('accessanalyzer','validate-policy',{policyType:'IDENTITY_POLICY',policyDocument:JSON.stringify(policy)}),checks:[],complete:false,awsWrites:0};
assert.equal(report.analyzer.findings.length,0);
const isolated=policy.Statement[1].NotResource[0],live='arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational';
for(const [label,time,region] of [['inside',new Date(start.getTime()+1000),'eu-north-1'],['expired',new Date(end.getTime()+1000),'eu-north-1'],['wrong-region',new Date(start.getTime()+1000),'us-east-1']]){
 if(report.checks.length)await new Promise(r=>setTimeout(r,15000));
 const r=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(policy)],ActionNames:['dynamodb:GetItem','dynamodb:PutItem','dynamodb:ConditionCheckItem','dynamodb:Scan','iam:PassRole','secretsmanager:GetSecretValue','lambda:InvokeFunction','kms:Decrypt'],ResourceArns:[isolated,live,"arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ParityRead","arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV","arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts","arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a"],ContextEntries:[{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[time.toISOString()],ContextKeyType:'date'},{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:[region],ContextKeyType:'string'}],MaxItems:1000});assert.ok(!r.IsTruncated);
 const rows=flatten(r).filter(x=>x.EvalResourceName.startsWith("arn:aws:"+x.EvalActionName.split(":")[0]+":"));fs.writeFileSync(E+"/proposal-security-debug.json",JSON.stringify({label,r},null,2));for(const x of rows){const data=x.EvalActionName.startsWith('dynamodb:');const expected=!data||x.EvalResourceName===live||label==='wrong-region'?'explicitDeny':label==='inside'?'allowed':'implicitDeny';assert.equal(x.EvalDecision,expected,x.EvalActionName+" "+x.EvalResourceName);}
 report.checks.push({label,rows});fs.writeFileSync(E+'/proposal-security.json',JSON.stringify(report,null,2)+'\n');
}
report.complete=true;fs.writeFileSync(E+'/proposal-security.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({complete:true,cases:report.checks.reduce((n,x)=>n+x.rows.length,0),findings:report.analyzer.findings.length}));
