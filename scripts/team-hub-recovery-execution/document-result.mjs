import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,E} from './aws.mjs';
for(const file of ['failure-readback','cleanup','protected-after','authority','source-fence-preservation-after','installed-security-audit','after/inventory'])assert.equal(read(E+'/'+file+'.json').complete??read(E+'/'+file+'.json').unchanged,true,file);
const root='docs/architecture/',report='team-hub-2b6-lambda-configuration-recovery-result.md';
const notice='**Lambda configuration recovery execution (9 October 2026): FAILED; temporary executor removed.** The single pinned workflow stopped on an explicit identity-policy denial for the Read function `:$LATEST` ARN. Command was never attempted. Full readback confirms both configurations/revisions/code unchanged and both Environment properties still MODIFIED. Authority remains LEGACY_WRITER epoch/version 1; business state empty, protected domains preserved. No retry or IAM patch. Qualified-ARN coverage requires separate security review; application/monitoring recovery acceptance and isolated AWS transaction/cursor proofs remain outstanding. [Execution result, cleanup and evidence]('+report+'). Earlier entries below are historical.\n\n';
for(const name of ['README-PHASE2-MIGRATION.md','team-hub-2b6-lambda-configuration-recovery-decision.md','team-hub-2b6-business-runtime-configuration-repair.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md']){
 const path=root+name,text=fs.readFileSync(path,'utf8');if(!text.includes('**Lambda configuration recovery execution (9 October 2026): FAILED;')){const pos=text.indexOf('\n');fs.writeFileSync(path,text.slice(0,pos+1)+'\n'+notice+text.slice(pos+1));}
}
const path=root+'domain-migration-status.json',status=read(path),team=status.domains.find(x=>x.domain==='Team Hub');
assert.ok(team);
status.scope='Authorized fixed recovery attempted once; Read qualified-ARN denial; no Lambda configuration change; temporary executor deleted';
status.currentPhase='M5 / 2B6 LAMBDA_CONFIGURATION_RECOVERY_FAILED';
team.configurationRecoveryExecution={status:'FAILED',report:root+report,evidence:E+'/workflow-history.json',cleanupEvidence:E+'/cleanup.json',temporaryResourcesCreated:2,temporaryResourcesRemaining:0,workflowExecutions:1,lambdaUpdateAttempts:1,successfulLambdaUpdates:0,authority:'LEGACY_WRITER',epoch:1,version:1,actualConfigurationStillIncomplete:true,frontendActivated:false};
team.configurationRecoveryDecision.status='EXECUTION_ATTEMPT_FAILED_SEE_RESULT';
team.nextStep='Separately review exact qualified Lambda ARN recovery permissions and fresh pins; no automatic retry or cutover.';
status.previousTaskAwsChanges=status.latestTaskAwsChanges;
status.latestTaskAwsChanges={task:'LAMBDA_CONFIGURATION_RECOVERY_EXECUTION_FAILED',temporaryResourcesCreated:2,temporaryResourcesDeleted:2,changeSetsCreated:1,changeSetsExecuted:1,workflowExecutions:1,lambdaUpdateAttempts:1,successfulLambdaConfigurationWrites:0,driftDiagnosticRequests:2,businessWrites:0,authorityWrites:0,productionChanges:0};
status.lastTaskAwsChanges=4;
fs.writeFileSync(path,JSON.stringify(status,null,2)+'\n');
console.log('Updated recovery result links and migration stop state.');
