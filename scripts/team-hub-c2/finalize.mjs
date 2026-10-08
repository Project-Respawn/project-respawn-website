import fs from 'node:fs';import assert from 'node:assert/strict';import {E,P,B,read,json,save,pin,sha,canonical} from './aws.mjs';
const c=pin();for(const name of ['artifact-review','preflight','policy-review','actual-security','authority-after','before/inventory','resumed/inventory','after/inventory','before/preservation','after/preservation','before/installed-iam','security-only/installed-iam','after/installed-iam','routes-before','routes-resumed','routes-after'])assert.equal(read(name).complete,true,name);
for(const kind of ['security','product']){assert.equal(read(kind+'-installed').verified,true);assert.equal(read(kind+'-installed').disableRollback,false);}
assert.ok(!fs.existsSync(E+'/STOP.json'));for(const e of json('docs/architecture/team-hub-c1-execution-evidence-2026-10-07/preflight.json').referencedEvidence)assert.equal(sha(e.path),e.sha256,e.path);
const inventory=read('after/inventory'),initial=read('before/inventory');assert.deepEqual(inventory.target,initial.target);assert.deepEqual(inventory.sources,initial.sources);assert.deepEqual(inventory.legacy,initial.legacy);assert.deepEqual(inventory.stacks,initial.stacks);
const writes=fs.readFileSync(E+'/aws-writes.jsonl','utf8').trim().split('\n').map(JSON.parse);assert.equal(writes.length,5);assert.equal(read('routes-after').checks.length,13);assert.ok(read('routes-after').checks.every(c=>c.status===403));
const security=read('security-gate'),product=read('product-gate'),result={at:new Date().toISOString(),status:'C2_AUTHORITY_READ_ACCEPTED_READY_FOR_D1_REVIEW',identity:read('preflight').identity,account:'058264289478',region:'eu-north-1',pins:c,securityChangeSet:security.changeSetId,productChangeSet:product.changeSetId,securityModifications:3,productModifications:2,additions:0,deletions:0,replacements:0,rollbackEnabled:true,authority:'LEGACY_WRITER',epoch:1,version:1,normalRoutesDenied:13,actualRoleIamDecisions:read('actual-security').checks.flatMap(x=>x.decisions).length,preflightIamDecisions:read('policy-review').checks.flatMap(x=>x.decisions).length,authorityProof:'ACTUAL_ROLE_IAM_SIMULATION; independent operator strong read; no runtime data-plane GetItem invoked',runtimeCodeUnchanged:true,businessRecordsChanged:0,awsWrites:writes.length,d1Deployed:false,frontendActivated:false,legacyFenceInstalled:false,productionChanged:false,c1ExecutionEvidencePreserved:true};save('result',result);
const link=n=>`team-hub-c2-execution-evidence-2026-10-07/${n}.json`;
const report=`# Project Respawn Team Hub 2B6 — C2 result

**C2 AUTHORITY READ ACCEPTED — READY FOR D1 REVIEW**

C2 security and product updates completed on 8 October 2026. Both stacks are UPDATE_COMPLETE with rollback enabled. No D1, runtime-code replacement, authority transition, frontend activation, Legacy fence or retirement, or production change occurred. Preparation began on 7 October; timestamped evidence remains in that session's directory.

## Identity and exact pins

Security operator: arn:aws:iam::058264289478:user/RavenTest. Product deployment: existing ProjectRespawn-TeamHub-Ntgre-Deploy assumed role, passing only the existing ProjectRespawn-TeamHub-Ntgre-ReadProofExecution role. Account 058264289478, eu-north-1. No new administrative grant.

- Product SHA256: ${c.productSha256}.
- Security SHA256: ${c.securitySha256}.
- Unchanged runtime ZIP SHA256: ${c.zipSha256}.

The original manifest and C1 referenced evidence hashes verify. No synthesis, rebuild, current-HEAD substitution or Lambda asset publication. One exact product template was published with AES256 and verified SHA256. [Artifact review](${link('artifact-review')}), [publication](${link('publication')}), [preflight](${link('preflight')}).

## Installed baseline and permission delta

Both ParityCommand and ParityRead initially matched the accepted dark templates: one ExactSyntheticTeamState inline policy, no attached identity policies, Lambda-only trust and v5 boundaries. Fresh inspection after the pause confirmed the intermediate state: v6 C2 boundaries and unchanged dark inline policies. Final readback matches the C2 inline policies and v6 boundaries exactly; both tables still have no resource policy. [Before](${link('before/installed-iam')}), [intermediate](${link('security-only/installed-iam')}), [installed](${link('after/installed-iam')}).

Only dynamodb:GetItem was added to both inline policies and matching boundaries, restricted to arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Journal, ForAllValues:StringEquals dynamodb:LeadingKeys CONTROL#AUTHORITY, and Null=false. It was also added to the existing NotAction ceiling. Existing Core invocation, own logs and AWS-managed Lambda KMS permissions are unchanged. No mutation, Query, Scan, Operational, cursor-secret, Cognito administration, foreign-domain or business-key grant.

The deployment caller policy adds only the exact C2 template URL and object ARN; all earlier rollback references remain. Access Analyzer returned no findings for the three changed security policies. Runtime inline documents match the corresponding reviewed boundaries. Before deployment, 136 IAM decisions compared actual deployed roles and the candidate. After deployment, 68 actual-role decisions passed. [Security review](${link('policy-review')}), [actual-role proof](${link('actual-security')}).

Authority GetItem is allowed under the actual installed roles; wrong/mixed/missing partition context, other Journal partitions, Operational/foreign tables and item mutations remain denied. Transaction-context mutation checks also deny. Core and own-log positive controls pass; foreign Lambda/logs, secrets, Cognito, IAM, business KMS and other services remain denied. These are AWS IAM evaluations of installed roles, not live Lambda DynamoDB requests or complete proof of every external policy layer.

LeadingKeys restricts PK, not SK. The unchanged dark runtime has no authority-reader/data-access entry point, so C2 cannot expose another sort key or enable business behavior. Future reviewed readers must fix SK=STATE. No trust expansion, injected handler or bypass was added to manufacture a data-plane read.

## Inspected change sets and execution

| Stack | Change set | Result |
|---|---|---|
| Security | ${security.changeSetId} | 3 policy modifications; UPDATE_COMPLETE |
| Product | ${product.changeSetId} | 2 runtime-role inline-policy modifications; UPDATE_COMPLETE |

Zero additions, deletions, replacements, conditional replacements or nested effects. All property changes require no recreation. The complete AWS-returned templates equal the pinned templates. Both execute requests explicitly used DisableRollback=false. No failed deployment or permission retry. [Security inspection](${link('security-gate')}), [product inspection](${link('product-gate')}), [security status](${link('security-status')}), [product status](${link('product-status')}).

Five direct AWS write calls: two CreateChangeSet, two ExecuteChangeSet and one pinned-template PutObject. CloudFormation's managed policy operations are not counted as separate operator calls. No DynamoDB writes.

## Live denial and protected state

All 13 normal authenticated routes returned 403 before deployment, after the security-only update and after the product update. Empty invalid command bodies guarded against business creation on an unexpected regression; no synthetic authorization override. Tokens remained in memory, collectors closed and temporary helper pages were removed. [Before](${link('routes-before')}), [resumed](${link('routes-resumed')}), [after](${link('routes-after')}).

Independent strongly consistent GetItem and complete authority-partition Query verify the exact C1 record and all approved metadata: CONTROL#AUTHORITY / STATE, team-hub-authority.v1, LEGACY_WRITER, epoch 1, version 1. Exactly one authority record; C1 temporary role/state machine remain absent. [Authority receipt](${link('authority-after')}).

Legacy remains 2,621 resources / FunctionDirectiveStack 167, with all inventoried templates unchanged. The four source tables remain empty with PITR/deletion protection and AVAILABLE backups. Core remains 8+5; Tournament 11; Team Hub 40+7. Stack and resource physical identities, API t54b88casf, both tables, Core/Tournament templates and Team runtime code/environment are preserved. Operational is empty; Journal contains 15 retained audits and one authority record, zero business rows. Business records changed: 0. [Final inventory](${link('after/inventory')}), [physical/template/runtime preservation](${link('after/preservation')}).

## Evidence handling

A local output-path error refreshed the older authority-plan/installed-iam.json during the first read-only collection. It must be treated as a refreshed snapshot, not its original historical capture. A new fresh read was then collected directly in the dedicated C2 directory; copying a snapshot was rejected by automatic approval review and was not performed. C1 execution evidence, the fixed authority request/metadata, original C2 templates and all C1 referenced pinned artifacts remain unchanged. Two local validation-request issues (Access Analyzer field casing and mixed IAM simulator transaction/item actions) were corrected without any policy change; the successful complete evidence supersedes those incomplete local attempts.

## Remaining gates and rollback

C2 is accepted only. D1 requires separate review/authorization of the pinned after-C2 product/security candidate, inspected deployment and D2 live telemetry acceptance. Do not use standalone D1: it would remove C2 permissions. Business authority/epoch enforcement remains a later runtime/live gate. Gate B installed source-fence proof remains reserved for separately authorized FROZEN maintenance. Frontend and state-authority rollback proofs remain separate.

No rollback was needed. If separately authorized before business activation, restore the accepted dark runtime identity policies first, then their boundaries/caller references through inspected changes; retain the C1 LEGACY record. Never delete/reinitialize authority or broaden access to recover a failed update. Any unexpected state/business data or resource drift stops automatic recovery.

**C2 AUTHORITY READ ACCEPTED — READY FOR D1 REVIEW**
`;
fs.writeFileSync('docs/architecture/team-hub-c2-execution-result.md',report);
const latest='**Latest C2 result: AUTHORITY READ ACCEPTED — READY FOR D1 REVIEW (8 October 2026).** Security/product updates complete, exact runtime policies and v6 boundaries verified; 68 actual-role IAM decisions pass and all 13 normal routes still deny. Authority remains LEGACY_WRITER, epoch/version 1; runtime code, frontend and protected domains unchanged. D1 not deployed. [C2 result](team-hub-c2-execution-result.md). Earlier entries below are historical.\n\n';
for(const file of ['team-hub-c1-c2-d1-execution-readiness.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md','team-hub-2b6-precutover-readiness.md']){const path='docs/architecture/'+file;let text=fs.readFileSync(path,'utf8');const index=text.indexOf('\n');text=text.slice(0,index+1)+'\n'+latest+text.slice(index+1);if(file==='team-hub-2b6-cutover-runbook.md')text=text.replace('C2 and D1 still need separate authorization.','C2 is accepted. D1 still needs separate review and authorization; use only the pinned after-C2 monitoring candidate. C2 installed IAM proof is simulation against actual roles, not live transactional/business enforcement.');fs.writeFileSync(path,text);}
const migration='docs/architecture/README-PHASE2-MIGRATION.md';let text=fs.readFileSync(migration,'utf8');text=text.replace(/<!-- TEAM 2B6 START -->[\s\S]*?<!-- TEAM 2B6 END -->/,'<!-- TEAM 2B6 START -->\n'+latest+'<!-- TEAM 2B6 END -->');fs.writeFileSync(migration,text);
const statusPath='docs/architecture/domain-migration-status.json',status=json(statusPath);let found=false;function visit(v){if(!v||typeof v!=='object')return;if(v.phase2B6){const x=v.phase2B6;found=true;x.status=result.status;x.gates=E+'/result.json';x.awsWrites=9;x.awsWriteCounting='C1 4 + C2 5 direct operator calls; managed resource operations counted separately in execution evidence';x.blockers=x.blockers.filter(s=>!s.startsWith('C2 '));x.nextStep='Separate D1 after-C2 monitoring review; no authority, fence or frontend activation';x.c2={status:'ACCEPTED_INSTALLED_IAM_AND_ROUTE_DENIAL',report:'docs/architecture/team-hub-c2-execution-result.md',evidence:E+'/result.json',actualRoleIamDecisions:68,normalRoutesDenied:13,businessRecordsChanged:0,awsWrites:5};}for(const x of Object.values(v))visit(x);}visit(status);assert.ok(found);fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
console.log(JSON.stringify({status:result.status,report:'docs/architecture/team-hub-c2-execution-result.md',awsWrites:5}));
