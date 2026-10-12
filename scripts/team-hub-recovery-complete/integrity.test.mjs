import test from 'node:test';import assert from 'node:assert/strict';
import {read,sha,E,B,Q} from './common.mjs';
import {verifyRecoveredFunction,verifyAcceptance} from './integrity.mjs';
const manifest=read(E+'/artifact-manifest.json'), inspection=read(B+'/inspection.json');
const trust=read(B+'/recovery-trust.json').Statement;
const source='arn:aws:states:eu-north-1:058264289478:stateMachine:ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009';
// Structural trust-condition model, not an STS or AWS simulator acceptance claim.
const permitted=(principal,account,arn)=>trust.some(s=>s.Effect==='Allow'&&s.Action==='sts:AssumeRole'&&s.Principal.Service===principal&&s.Condition.StringEquals['aws:SourceAccount']===account&&s.Condition.ArnEquals['aws:SourceArn']===arn);
test('Trust model accepts exact service/account/machine',()=>assert.equal(permitted('states.amazonaws.com','058264289478',source),true));
for(const [label,principal,account,arn] of [['human','arn:aws:iam::058264289478:user/RavenTest','058264289478',source],['wrong service','lambda.amazonaws.com','058264289478',source],['wrong account','states.amazonaws.com','000000000000',source],['wrong workflow','states.amazonaws.com','058264289478',source+'-other']])test('Trust model denies '+label,()=>assert.equal(permitted(principal,account,arn),false));
test('All new and preserved artifact bytes match',()=>{for(const a of [...manifest.artifacts,...manifest.preservedArtifacts])assert.equal(sha(a.path),a.sha256,a.path);});
test('Only demonstrated Encrypt lifecycle policy statements change',()=>{const old=read(Q+'/recovery-policy.template.json'),next=read(E+'/recovery-policy.template.json');const changed=old.Statement.flatMap((s,i)=>JSON.stringify(s)===JSON.stringify(next.Statement[i])?[]:[i]);assert.deepEqual(changed,[1,2,5,6,7]);assert.deepEqual(next.Statement[1].Action,['kms:Encrypt','kms:Decrypt']);});
for(const f of inspection.functions){const after={...structuredClone(f.actual),Environment:{Variables:f.desired},RevisionId:'new-reviewed-revision'};
 test(f.kind+' complete map and stable non-environment properties accepted',()=>assert.equal(verifyRecoveredFunction(f.actual,after,f.desired,'iam','iam'),true));
 for(const defect of ['missingEnvironment','code','role','memory','status','revision','iam'])test(f.kind+' rejects '+defect,()=>{const x=structuredClone(after);let iam='iam';if(defect==='missingEnvironment')delete x.Environment.Variables.CORE_ENVIRONMENT;if(defect==='code')x.CodeSha256='changed';if(defect==='role')x.Role+='-other';if(defect==='memory')x.MemorySize++;if(defect==='status')x.LastUpdateStatus='Failed';if(defect==='revision')x.RevisionId=f.actual.RevisionId;if(defect==='iam')iam='changed';assert.throws(()=>verifyRecoveredFunction(f.actual,x,f.desired,'iam',iam));});
}
const routes=Array.from({length:16},(_,i)=>({route:'fixture-'+i,status:403}));const complete={readConfiguration:true,commandConfiguration:true,monitoring:true,businessDataUnchanged:true,protectedDomains:true,cleanup:true,functionDrift:['IN_SYNC','IN_SYNC'],authority:{status:200,mode:'LEGACY_WRITER',epoch:1,version:1},routes,expectedRoutes:routes.map(r=>r.route)};
test('Complete live evidence schema accepted, no AWS claim from fixture',()=>assert.equal(verifyAcceptance(complete),true));
for(const defect of ['monitoring','cleanup','drift','authority','route'])test('Incomplete acceptance rejects '+defect,()=>{const x=structuredClone(complete);if(defect==='monitoring'||defect==='cleanup')x[defect]=false;if(defect==='drift')x.functionDrift[0]='MODIFIED';if(defect==='authority')x.authority.mode='TARGET_WRITER';if(defect==='route')x.routes[0].status=503;assert.throws(()=>verifyAcceptance(x));});
