import assert from 'node:assert/strict';import {aws,read,save,canonical} from './aws.mjs';
const E='docs/architecture/team-hub-execution-kms-evidence-2026-10-09',m=read(E+'/candidate.json'),s=read(E+'/security.template.json'),old=read('docs/architecture/team-hub-cursor-security-evidence-2026-10-08/security.template.json');
const policy=s.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument,boundary=s.Resources.ExecutionBoundary.Properties.PolicyDocument,caller=s.Resources.PreparationCaller.Properties.PolicyDocument;
const role='arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution',r={at:new Date().toISOString(),checks:[],analyzer:[],attachments:[],complete:false,awsWrites:0,liveKmsProven:false};
const persist=()=>save('security-gate-tests',r),entries=o=>Object.entries(o).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:Array.isArray(v)?v:[v],ContextKeyType:Array.isArray(v)?'stringList':'string'}));
for(const[id,p]of [['execution-identity',policy],['execution-boundary',boundary],['caller-policy-and-boundary',caller]]){
 const a=await aws('accessanalyzer','validate-policy',{policyDocument:JSON.stringify(p),policyType:'IDENTITY_POLICY'});r.analyzer.push({id,findings:a.findings});persist();assert.ok(a.findings.every(f=>!['ERROR','SECURITY_WARNING'].includes(f.findingType)));
}
for(const id of ['ExecutionRole','DeploymentCaller']){
 const props=old.Resources[id].Properties,actual=(await aws('iam','list-attached-role-policies',{RoleName:props.RoleName})).AttachedPolicies.map(p=>p.PolicyArn).sort();
 const expected=(props.ManagedPolicyArns??[]).map(p=>typeof p==='string'?p:'arn:aws:iam::058264289478:policy/'+old.Resources[p.Ref].Properties.ManagedPolicyName).sort();assert.deepEqual(actual,expected);r.attachments.push({role:props.RoleName,actual});
}
const cases=[],region={'aws:RequestedRegion':'eu-north-1'},secret='arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV';
function add(label,action,resource,expected,context=region,kind='execution'){cases.push({label,action,resource,expected,context,kind});}
add('lambda-no-identity-grant','kms:Decrypt',m.lambdaKey,'implicitDeny',{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478',...region});
for(const k of read('docs/architecture/phase2a-tournament-kms-correction-evidence-2026-10-04/key-inventory.json').keys.filter(k=>k.arn!==m.lambdaKey&&k.arn!==m.secretKey))add('inventory-key-'+k.id,'kms:Decrypt',k.arn,'explicitDeny');
for(const key of ['arn:aws:kms:eu-north-1:058264289478:key/00000000-0000-0000-0000-000000000000',m.lambdaKey.replace('eu-north-1','eu-west-1'),m.lambdaKey.replace('058264289478','111122223333')])add('wrong-key-'+key,'kms:Decrypt',key,'explicitDeny');
for(const key of [m.lambdaKey,m.secretKey])for(const action of ['kms:Encrypt','kms:CreateGrant','kms:PutKeyPolicy','kms:ScheduleKeyDeletion','kms:RevokeGrant','kms:DescribeKey'])add('admin-'+key,action,key,'explicitDeny');
add('lambda-generate-key-denied','kms:GenerateDataKey',m.lambdaKey,'explicitDeny');add('global-create-key','kms:CreateKey','*','explicitDeny');
const ctx={...region,'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','kms:EncryptionContext:SecretARN':secret};
for(const action of ['kms:Decrypt','kms:GenerateDataKey'])add('preserved-cursor-key',action,m.secretKey,'allowed',ctx);
for(const [label,key,value]of [['wrong-service','kms:ViaService','lambda.eu-north-1.amazonaws.com'],['wrong-secret','kms:EncryptionContext:SecretARN',secret.replace('TeamHub','Core')],['wrong-account','kms:CallerAccount','111122223333'],['wrong-region','aws:RequestedRegion','eu-west-1'],['missing-service','kms:ViaService',null],['missing-secret','kms:EncryptionContext:SecretARN',null]]){const c={...ctx};if(value===null)delete c[key];else c[key]=value;add(label,'kms:Decrypt',m.secretKey,'denied',c);}
for(const name of ['ParityRead','ParityCommand','PreviewRead']){
 const functionArn='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-'+name;
 for(const action of ['lambda:GetFunctionConfiguration','lambda:UpdateFunctionConfiguration','lambda:UpdateFunctionCode'])add('repair-and-rollback-'+name,action,functionArn,'allowed');
 const runtimeRole='arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-'+name;
 add('runtime-passrole-'+name,'iam:PassRole',runtimeRole,'allowed',{'iam:PassedToService':'lambda.amazonaws.com',...region});
 add('wrong-service-passrole-'+name,'iam:PassRole',runtimeRole,'denied',{'iam:PassedToService':'ec2.amazonaws.com',...region});
}
for(const domain of ['Core','Tournaments','Commerce','Creator','LegacyPlatform']){
 add('foreign-function-'+domain,'lambda:UpdateFunctionConfiguration','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-'+domain+'-Ntgre-Contracts','denied');
 add('foreign-table-'+domain,'dynamodb:GetItem','arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-'+domain+'-Ntgre-Operational','denied');
 add('foreign-passrole-'+domain,'iam:PassRole','arn:aws:iam::058264289478:role/ProjectRespawn-'+domain+'-Ntgre-Contracts','explicitDeny',{'iam:PassedToService':'lambda.amazonaws.com',...region});
}
add('production-function','lambda:UpdateFunctionConfiguration','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Production-ParityRead','denied');
for(const action of ['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:GetItem'])add('no-business-data',action,'arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational','denied');
add('cognito-admin','cognito-idp:AdminCreateUser','*','explicitDeny');add('core-invoke','lambda:InvokeFunction','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts','denied');
const stack='arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-TeamHub-Ntgre/test',prefix='https://cdk-hnb659fds-assets-058264289478-eu-north-1.s3.eu-north-1.amazonaws.com/',rollback='team-hub/as/5a2d99f4919fd07c619f483e556a0464b9cbaad0be00665201438b0f4ec7d0e9.template.json';
for(const[key,expected]of [[m.productObjectKey,'allowed'],[rollback,'allowed'],[m.previousProductObjectKey,'denied'],['team-hub/unreviewed.template.json','denied']]){
 add('template-'+key,'cloudformation:CreateChangeSet',stack,expected,{...region,'cloudformation:TemplateUrl':prefix+key,'cloudformation:RoleArn':role},'caller');
 add('object-'+key,'s3:GetObject','arn:aws:s3:::cdk-hnb659fds-assets-058264289478-eu-north-1/'+key,expected,region,'caller');
}
for(const action of ['cloudformation:ExecuteChangeSet','cloudformation:DescribeStacks','cloudformation:DeleteChangeSet'])add('caller-lifecycle',action,stack,'allowed',region,'caller');
add('caller-pass-execution','iam:PassRole',role,'allowed',{'iam:PassedToService':'cloudformation.amazonaws.com'},'caller');
add('caller-wrong-service','iam:PassRole',role,'explicitDeny',{'iam:PassedToService':'lambda.amazonaws.com'},'caller');
add('caller-runtime-passrole','iam:PassRole',role.replace('ReadProofExecution','ParityRead'),'explicitDeny',{'iam:PassedToService':'cloudformation.amazonaws.com'},'caller');
add('caller-kms','kms:Decrypt',m.lambdaKey,'explicitDeny',region,'caller');
for(const name of ['ProjectRespawn-Core-Ntgre','ProjectRespawn-Tournaments-Ntgre','ProjectRespawn-TeamHub-Production','amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332'])add('caller-other-stack-'+name,'cloudformation:ExecuteChangeSet','arn:aws:cloudformation:eu-north-1:058264289478:stack/'+name+'/test','explicitDeny',region,'caller');
for(const resource of policy.Statement.find(x=>x.Effect==='Allow'&&Array.isArray(x.Action)&&x.Action.includes('s3:GetObject')).Resource)add('runtime-rollback-archive','s3:GetObject',resource,'allowed');
// Supported deny controls: hypothetical Allows exist only inside simulation inputs,
// never in candidate artifacts. They isolate explicit deny behavior, not live KMS access.
for(const mode of ['before','after'])cases.push({label:'lambda-explicit-deny-control',action:'kms:Decrypt',resource:m.lambdaKey,expected:mode==='before'?'explicitDeny':'allowed',context:region,kind:'control-'+mode});
for(const c of cases.filter(x=>x.expected==='explicitDeny'&&x.kind==='execution'&&x.action.startsWith('kms:')))cases.push({...c,label:'overgrant-'+c.label,kind:'control-after'});
for(let i=0;i<cases.length;i+=5){const result=await Promise.allSettled(cases.slice(i,i+5).map(async c=>{
 let p=structuredClone(c.kind==='caller'?caller:c.kind==='control-before'?old.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument:policy),b=structuredClone(c.kind==='caller'?caller:c.kind==='control-before'?old.Resources.ExecutionBoundary.Properties.PolicyDocument:boundary);
 if(c.kind.startsWith('control')){p.Statement.push({Effect:'Allow',Action:c.action,Resource:c.resource});b.Statement.push({Effect:'Allow',Action:c.action,Resource:c.resource});}
 const res=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(p)],PermissionsBoundaryPolicyInputList:[JSON.stringify(b)],ActionNames:[c.action],ResourceArns:[c.resource],ContextEntries:entries(c.context)});const d=res.EvaluationResults[0];
 assert.ok(c.expected==='denied'?d.EvalDecision!=='allowed':d.EvalDecision===c.expected,c.label+' '+d.EvalDecision+' expected '+c.expected);return {...c,decision:d.EvalDecision};
 }));for(const v of result){if(v.status==='rejected'){persist();throw v.reason;}r.checks.push(v.value);}persist();}
r.complete=true;persist();console.log(JSON.stringify({complete:true,checks:r.checks.length,analyzer:r.analyzer.length}));

