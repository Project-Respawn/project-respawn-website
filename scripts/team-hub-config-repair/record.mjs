import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {read,save,E} from './aws.mjs';
const report='team-hub-2b6-business-runtime-configuration-repair.md';
const note='**Configuration repair (9 October 2026): BLOCKED — separate execution-security review required.** The unchanged compiled ZIP passes offline with the full environment map. Read lacks four additions; Command lacks three. Actual execution-role KMS denies against alias/aws/lambda are confirmed; IAM is unchanged. A two-function environment-only draft is pinned, not deployed, and also requires exact artifact-reference review. LEGACY_WRITER epoch/version 1, empty business state and 48+7 remain. [Diagnosis, draft, validation and recovery plan]('+report+'). Earlier entries below are historical.\n\n';
for(const name of ['README-PHASE2-MIGRATION.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md','team-hub-2b6-business-runtime-readiness.md']){
 const path='docs/architecture/'+name,text=fs.readFileSync(path,'utf8');
 if(!text.includes('**Configuration repair (9 October 2026)')){const first=text.indexOf('\n');fs.writeFileSync(path,text.slice(0,first+1)+'\n'+note+text.slice(first+1));}
}
const path='docs/architecture/domain-migration-status.json',status=read(path),team=status.domains.find(x=>x.domain==='Team Hub');
status.scope='Read-only Team Hub configuration investigation and blocked offline repair draft; no AWS changes';status.currentPhase='M5 / 2B6 BUSINESS_RUNTIME_CONFIGURATION_REPAIR_BLOCKED';
team.phase='M5_2B6_BUSINESS_RUNTIME_CONFIGURATION_REPAIR_BLOCKED';
team.nextStep='Separate execution-role Lambda KMS and exact artifact-binding review before any configuration repair or rollback; no freeze';
team.lastVerified=read(E+'/inventory.json').at;
team.configurationRepair={status:'BLOCKED_EXECUTION_KMS_AND_ARTIFACT_BINDING',report:'docs/architecture/'+report,artifactManifest:E+'/artifact-manifest.json',manifestSha256:read(E+'/artifact-manifest.json').manifestSha256,deployed:false,awsChanges:0,authority:'LEGACY_WRITER',epoch:1,version:1,productResources:48,securityResources:7,sourceChanged:false,runtimeChanged:false,securityChanged:false,liveAccepted:false};
if(!team.evidence.includes('docs/architecture/'+report))team.evidence.push('docs/architecture/'+report);
fs.writeFileSync(path,JSON.stringify(status,null,2)+'\n');
const tests=spawnSync(process.execPath,['--test','scripts/team-hub-config-repair/configuration.test.mjs'],{encoding:'utf8',windowsHide:true});
fs.mkdirSync('.tmp/team-hub-config-repair/validation',{recursive:true});
fs.writeFileSync('.tmp/team-hub-config-repair/validation/configuration.log',(tests.stdout??'')+(tests.stderr??''));
save('configuration-test-result',{at:new Date().toISOString(),command:'node --test scripts/team-hub-config-repair/configuration.test.mjs',exit:tests.status,passed:Number(tests.stdout?.match(/pass (\d+)/)?.[1]??0),failed:Number(tests.stdout?.match(/fail (\d+)/)?.[1]??0),compiledZip:true,liveAcceptance:false,awsWrites:0,deployedBusinessRoutesCovered:16,additionalUnpublishedContractRoutesCovered:3});
assert.equal(tests.status,0,'Configuration regression failed');
