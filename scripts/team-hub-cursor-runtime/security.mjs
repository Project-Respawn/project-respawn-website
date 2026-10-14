import fs from 'node:fs';import assert from 'node:assert/strict';
import {aws,canonical} from '../team-hub-describekey-execution/aws.mjs';
const E='docs/architecture/team-hub-cursor-runtime-correction-evidence-2026-10-13';
const save=r=>fs.writeFileSync(E+'/security.json',JSON.stringify(r,null,2)+'\n');
const r={at:new Date().toISOString(),awsWrites:0,roles:[],checks:[],analyzer:[],complete:false};
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');r.identity=identity;
const old=JSON.parse(fs.readFileSync('docs/architecture/team-hub-final-controlled-cutover-evidence-2026-10-13/preflight/installed-security-audit.json'));
for(const kind of ['Read','Command']){const name='ProjectRespawn-TeamHub-Ntgre-Parity'+kind,accepted=old.roles.find(x=>x.name===name),role=(await aws('iam','get-role',{RoleName:name})).Role;
 const names=(await aws('iam','list-role-policies',{RoleName:name})).PolicyNames,inline=[];
 for(const PolicyName of names)inline.push({name:PolicyName,document:(await aws('iam','get-role-policy',{RoleName:name,PolicyName})).PolicyDocument});
 const arn=role.PermissionsBoundary.PermissionsBoundaryArn,meta=(await aws('iam','get-policy',{PolicyArn:arn})).Policy,boundary=(await aws('iam','get-policy-version',{PolicyArn:arn,VersionId:meta.DefaultVersionId})).PolicyVersion.Document;
 assert.equal(canonical(inline),canonical(accepted.inline));assert.equal(canonical(boundary),canonical(accepted.boundary.document));
 const attached=(await aws('iam','list-attached-role-policies',{RoleName:name})).AttachedPolicies;assert.equal(attached.length,0);
 r.roles.push({kind,name,arn:role.Arn,trust:role.AssumeRolePolicyDocument,inline,boundary:{arn,document:boundary},attached,unchanged:true});save(r);
 for(const [type,document]of [['identity',inline[0].document],['boundary',boundary]]){const v=await aws('accessanalyzer','validate-policy',{policyDocument:JSON.stringify(document),policyType:'IDENTITY_POLICY'});r.analyzer.push({kind,type,findings:v.findings});assert.ok(v.findings.every(x=>!['ERROR','SECURITY_WARNING'].includes(x.findingType)));save(r);}
}
const fn=(await aws('lambda','get-function-configuration',{FunctionName:'ProjectRespawn-TeamHub-Ntgre-ParityRead'}));r.readConfiguration=fn;
const own=fn.Environment.Variables.TEAM_CURSOR_SECRET_ARN;assert.ok(own);const secret=await aws('secretsmanager','describe-secret',{SecretId:own});assert.equal(secret.ARN,own);r.secret=secret;
const key=(await aws('kms','describe-key',{KeyId:secret.KmsKeyId??'alias/aws/secretsmanager'})).KeyMetadata;assert.equal(key.KeyManager,'AWS');r.key=key;
const ctx={'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','aws:RequestedRegion':'eu-north-1','kms:EncryptionContext:SecretARN':own,'kms:ResourceAliases':['alias/aws/secretsmanager']};
const entries=c=>Object.entries(c).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:Array.isArray(v)?v:[v],ContextKeyType:Array.isArray(v)?'stringList':'string'}));
const cases=[{action:'secretsmanager:GetSecretValue',resource:own,context:{},allowed:true,label:'own-secret'}, {action:'secretsmanager:GetSecretValue',resource:own.replace('TeamHub','Tournament'),context:{},allowed:false,label:'foreign-secret'}, {action:'secretsmanager:PutSecretValue',resource:own,context:{},allowed:false,label:'no-secret-write'}, {action:'kms:Decrypt',resource:key.Arn,context:ctx,allowed:true,label:'exact-service-key'}];
for(const [label,k,v]of [['wrong-secret','kms:EncryptionContext:SecretARN',own.replace('TeamHub','Core')],['direct-kms','kms:ViaService',null],['wrong-service','kms:ViaService','s3.eu-north-1.amazonaws.com'],['wrong-account','kms:CallerAccount','111122223333']]){const c={...ctx};if(v===null)delete c[k];else c[k]=v;cases.push({label,action:'kms:Decrypt',resource:key.Arn,context:c,allowed:false});}
for(const alias of ['alias/customer-business','alias/unknown','alias/aws/s3'])cases.push({label:alias,action:'kms:Decrypt',resource:'arn:aws:kms:eu-north-1:058264289478:key/00000000-0000-4000-8000-000000000001',context:{...ctx,'kms:ResourceAliases':[alias]},allowed:false});
for(const action of ['kms:PutKeyPolicy','kms:CreateGrant','kms:ScheduleKeyDeletion','cognito-idp:AdminCreateUser'])cases.push({label:action,action,resource:action.startsWith('kms:')?key.Arn:'arn:aws:cognito-idp:eu-north-1:058264289478:userpool/eu-north-1_n24iLL7QE',context:ctx,allowed:false});
for(const role of r.roles)for(const c of cases){const v=await aws('iam','simulate-principal-policy',{PolicySourceArn:role.arn,ActionNames:[c.action],ResourceArns:[c.resource],ContextEntries:entries(c.context)}),decision=v.EvaluationResults[0].EvalDecision;const expected=role.kind==='Read'&&c.allowed;r.checks.push({kind:role.kind,...c,expected,decision});save(r);assert.equal(decision==='allowed',expected,role.kind+' '+c.label);await new Promise(resolve=>setTimeout(resolve,600));}
r.complete=true;r.liveDecryptionInThisTask=false;r.acceptedLiveDecryptionEvidence='docs/architecture/team-hub-isolated-quota-execution-evidence-2026-10-12/result.json';save(r);console.log(JSON.stringify({complete:true,checks:r.checks.length,analyzer:r.analyzer.length,secret:own,key:key.Arn,awsWrites:0}));
