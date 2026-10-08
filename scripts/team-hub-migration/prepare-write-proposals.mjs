// Local JSON preparation only. No execution path.
import {read,save,F,digest} from './final-read.mjs';
const E='docs/architecture/team-hub-2b3-evidence-2026-10-05';
const tables=read(E+'/table-inventory.json').tables;
const sourceArns=tables.map(t=>t.table.TableArn);
const bucket=read(E+'/logo-inventory.json').bucket;
const targetArns=['Operational','Journal'].map(s=>'arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-'+s);
const security=read('docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05/lockdown-security.template.json');
const proposed=structuredClone(security);
const statement={Sid:'ExactDarkTeamTableLifecycle',Effect:'Allow',Action:['dynamodb:CreateTable','dynamodb:DescribeTable','dynamodb:UpdateTable','dynamodb:DescribeContinuousBackups','dynamodb:UpdateContinuousBackups','dynamodb:DescribeTimeToLive','dynamodb:UpdateTimeToLive','dynamodb:ListTagsOfResource','dynamodb:TagResource','dynamodb:UntagResource'],Resource:targetArns,Condition:{StringEquals:{'aws:RequestedRegion':'eu-north-1'}}};
for(const document of [proposed.Resources.ExecutionBoundary.Properties.PolicyDocument,proposed.Resources.ExecutionRole.Properties.Policies.find(p=>p.PolicyName==='ReadProofLifecycle').PolicyDocument]){
 // The exact-API NotResource deny already rejects every enumerated foreign API.
 // Remove only that redundant enumeration to keep the managed boundary under 6144 characters.
 const exactApiDeny=document.Statement.find(s=>s.Effect==='Deny'&&s.Action==='apigateway:*'&&s.NotResource);
 if(!exactApiDeny)throw Error('Exact API deny missing');
 document.Statement=document.Statement.filter(s=>!(s.Effect==='Deny'&&s.Action==='apigateway:*'&&Array.isArray(s.Resource)&&s.Resource.includes('arn:aws:apigateway:*::/restapis*')));
 for(const s of document.Statement)if(s.Effect==='Deny'&&Array.isArray(s.Action)&&s.Action.includes('dynamodb:*'))s.Action=s.Action.filter(a=>a!=='dynamodb:*');
 document.Statement.find(s=>s.Effect==='Deny'&&s.Condition?.StringNotEquals?.['aws:RequestedRegion']==='eu-north-1').Action.push('dynamodb:*');
 document.Statement.push(statement,
  {Sid:'DenyOtherDynamoResources',Effect:'Deny',Action:'dynamodb:*',NotResource:targetArns});
}
if(JSON.stringify(proposed.Resources.ExecutionBoundary.Properties.PolicyDocument).length>6144)throw Error('Managed boundary size exceeded');
save('dark-security.template',proposed);
const policies=sourceArns.map(Resource=>({ResourceArn:Resource,Policy:{Version:'2012-10-17',Statement:[{Sid:'TeamHubSourceBusinessWriteFence',Effect:'Deny',Principal:'*',Action:['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:BatchWriteItem','dynamodb:PartiQLInsert','dynamodb:PartiQLUpdate','dynamodb:PartiQLDelete'],Resource}]}}));
const logoPolicy=structuredClone(read(F+'/logo-resource-policy.json').policy);
logoPolicy.Statement.push({Sid:'TeamHubLogoWriteFence',Effect:'Deny',Principal:'*',Action:['s3:PutObject','s3:DeleteObject','s3:DeleteObjectVersion','s3:AbortMultipartUpload'],Resource:'arn:aws:s3:::'+bucket+'/team-logos/*'});
save('write-sets',{status:'LOCAL_PROPOSALS_NOT_APPLIED',account:'058264289478',region:'eu-north-1',A:{configuration:F+'/legacy-protection-proposal.json',resultingActions:['dynamodb:UpdateContinuousBackups','dynamodb:UpdateTable'],resources:sourceArns,backups:tables.map(t=>({tableName:t.table.TableName,backupNamePattern:'ProjectRespawn-TeamHub-Ntgre-M4-'+t.model+'-<APPROVED_UTC_GATE_STAMP>',action:'dynamodb:CreateBackup'}))},B:{restores:tables.map(t=>({sourceTable:t.table.TableName,backupArn:'BIND_RETURNED_AVAILABLE_BACKUP_ARN_FROM_A',targetTable:'ProjectRespawn-TeamHub-Ntgre-M4Restore-'+t.model+'-20261005'})),actions:['dynamodb:RestoreTableFromBackup','dynamodb:DescribeTable','dynamodb:Scan','dynamodb:UpdateTable','dynamodb:DeleteTable'],cleanupOnlyNewRestoreTables:true,newTables:4},C:{product:F+'/dark-target.template.json',security:F+'/dark-security.template.json',productAdditions:2,securityModifications:['ExecutionBoundary','ExecutionRole'],securityAdditions:0,acceptedSecurityDigest:digest(security),proposedSecurityDigest:digest(proposed),runtimePermissionsUnchanged:true},D:{modeA:{newIdentities:0,dataWrites:0},modeB:{status:'REAUTHORIZE_AFTER_NONEMPTY_INVENTORY',reference:E+'/migration-identity-proposal.json',newDeclarations:2}},E:{status:'DESIGN_ONLY_NOT_INSTALLED',controlRow:{table:targetArns[1],PK:'CONTROL#AUTHORITY',SK:'STATE',mode:'LEGACY_WRITER',epoch:0,version:1,ttl:false},sourceTablePolicies:policies,logoPolicy:{bucket,document:logoPolicy},legacyControlRead:{Effect:'Allow',Action:['dynamodb:GetItem','dynamodb:ConditionCheckItem'],Resource:targetArns[1],Condition:{'ForAllValues:StringEquals':{'dynamodb:LeadingKeys':['CONTROL#AUTHORITY']},StringEquals:{'aws:RequestedRegion':'eu-north-1'}}},newDeclarations:0,requiresRuntimeAtomicGuard:true,requiresLiveNegativeTests:true,requiresAdministrativeMaintenanceFreeze:true},awsWrites:0});
console.log(JSON.stringify({legacyProtection:4,restoreTables:4,darkTables:2,securityModified:2,newIamModeA:0,fencePolicies:4,awsWrites:0}));
