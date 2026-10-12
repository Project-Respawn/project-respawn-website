import assert from 'node:assert/strict';
import {aws,save,read,canonical,sha} from './aws.mjs';
const r={at:new Date().toISOString(),identity:await aws('sts','get-caller-identity'),keys:[],awsWrites:0};
assert.equal(r.identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
for(const alias of ['alias/aws/lambda','alias/aws/secretsmanager']){
 const metadata=(await aws('kms','describe-key',{KeyId:alias})).KeyMetadata;
 assert.equal(metadata.KeyManager,'AWS');assert.equal(metadata.KeyState,'Enabled');
 const policy=JSON.parse((await aws('kms','get-key-policy',{KeyId:metadata.Arn,PolicyName:'default'})).Policy);
 r.keys.push({alias,metadata,policy});save('key-policies',r);
}
assert.equal(canonical(r.keys[0].policy),canonical(read('docs/architecture/phase2a-tournament-runtime-kms-evidence-2026-10-04/requirement.json').keyPolicy));
r.tournamentPolicyUnchanged=true;
const old=read('docs/architecture/team-hub-config-repair-evidence-2026-10-09/provider-audit.json');
r.denials=old.events.filter(e=>e.service==='kms.amazonaws.com'&&e.eventName==='Decrypt'&&e.errorCode==='AccessDenied');
assert.equal(r.denials.length,21);assert.ok(r.denials.every(e=>e.issuer==='arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution'));
r.auditSha256=sha('docs/architecture/team-hub-config-repair-evidence-2026-10-09/provider-audit.json');r.complete=true;save('key-policies',r);
console.log(JSON.stringify({complete:true,keys:r.keys.map(k=>k.alias),denials:r.denials.length}));
