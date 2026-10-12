import fs from 'node:fs';import assert from 'node:assert/strict';import {aws,save,E} from './aws.mjs';import {secret} from './policy.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),s=read(E+'/security.template.json'),c=read(E+'/candidate.json'),execution='arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution',stack='arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-TeamHub-Ntgre/*';
const ctx=(ContextKeyName,value)=>({ContextKeyName,ContextKeyValues:[value],ContextKeyType:'string'}),region=ctx('aws:RequestedRegion','eu-north-1');
const cases=[
 ['own-secret','execution',['secretsmanager:CreateSecret','secretsmanager:DescribeSecret','secretsmanager:GetSecretValue','secretsmanager:TagResource'],[secret.replace('??????','ABC123')],[],true],
 ['foreign-secret','execution',['secretsmanager:CreateSecret','secretsmanager:GetSecretValue'],[secret.replace('TeamHub','Core').replace('??????','ABC123')],[],false],
 ['secret-update-delete-replicate','execution',['secretsmanager:UpdateSecret','secretsmanager:DeleteSecret','secretsmanager:ReplicateSecretToRegions'],[secret.replace('??????','ABC123')],[],false],
 ['random-generation','execution',['secretsmanager:GetRandomPassword'],['*'],[],true],
 ['exact-current-new-rollback-archives','execution',['s3:GetObject'],[c.assetKey,'team-hub/as/'+c.baseline.runtimeSha256+'.zip','team-hub/d1-dark/a36406c42c727b4d8c262083e0cb95807f2404c4c8649b2eacc559915f4ba7d5.zip'].map(k=>'arn:aws:s3:::'+c.bucket+'/'+k),[],true],
 ['unreviewed-archive','execution',['s3:GetObject'],['arn:aws:s3:::'+c.bucket+'/unreviewed.zip'],[],false],
 ['no-role-replacement','execution',['iam:CreateRole'],['arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ParityRead'],[],false],
 ['foreign-function','execution',['lambda:UpdateFunctionCode'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts'],[],false],
 ['broad-log-admin','execution',['logs:PutResourcePolicy','logs:CreateLogDelivery'],['*'],[],false],
 ['candidate-template','caller',['cloudformation:CreateChangeSet'],[stack],[ctx('cloudformation:RoleArn',execution),ctx('cloudformation:TemplateUrl',c.templateUrl)],true],
 ['rollback-template','caller',['cloudformation:CreateChangeSet'],[stack],[ctx('cloudformation:RoleArn',execution),ctx('cloudformation:TemplateUrl',read('docs/architecture/team-hub-authority-status-evidence-2026-10-08/candidate.json').templateUrl)],true],
 ['foreign-stack','caller',['cloudformation:CreateChangeSet'],[stack.replace('TeamHub','Tournaments')],[ctx('cloudformation:RoleArn',execution),ctx('cloudformation:TemplateUrl',c.templateUrl)],false],
 ['foreign-passrole','caller',['iam:PassRole'],[execution.replace('TeamHub','Core')],[ctx('iam:PassedToService','cloudformation.amazonaws.com')],false]
];
const result={at:new Date().toISOString(),checks:[],complete:false,awsWrites:0};const persist=()=>save('deployment-security-review',result);persist();
for(let i=0;i<cases.length;i+=4)await Promise.all(cases.slice(i,i+4).map(async([label,kind,actions,resources,context,expected])=>{const boundary=s.Resources[kind==='caller'?'PreparationCaller':'ExecutionBoundary'].Properties.PolicyDocument,policy=kind==='caller'?boundary:s.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument;const r=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(policy)],PermissionsBoundaryPolicyInputList:[JSON.stringify(boundary)],ActionNames:actions,ResourceArns:resources,ContextEntries:[region,...context]});const decisions=r.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({action:x.EvalActionName,resource:y.EvalResourceName,decision:y.EvalResourceDecision})):[{action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision}]);result.checks.push({label,expected,decisions});persist();assert.equal(decisions.length,actions.length*resources.length);assert.ok(decisions.every(d=>(d.decision==='allowed')===expected),label);}));
result.complete=true;persist();console.log(JSON.stringify({complete:true,decisions:result.checks.flatMap(r=>r.decisions).length}));
