// Reviewed M4 evidence/status update. No ownership reassignment or AWS call.
import fs from 'node:fs';
import {read,save,digest,E} from './read-only.mjs';
import {renderReports,validateLedger} from '../migration/ledger.mjs';
const ledgerPath='docs/architecture/legacy-resource-ownership.json';
const l=read(ledgerPath),inventory=read(E+'/table-inventory.json');
const tableIds=new Set(inventory.tables.map(t=>t.resourceId));
for(const r of l.resources)if(r.currentDomainAttribution==='TEAM HUB'){
 if(tableIds.has(r.resourceId))r.migrationStatus='MIGRATION_PREP';
 for(const p of ['docs/architecture/team-hub-2b3-state-inventory.md',E+'/reader-writer-inventory.json',...(tableIds.has(r.resourceId)?[E+'/table-inventory.json']:[])])if(!r.evidence.some(e=>e.path===p))r.evidence.push({path:p});
 r.currentAuthority='LegacyPlatform';
}
l.latestReadOnlyReview={at:read(E+'/team-baseline.json').at,evidence:E+'/legacy-after.json',awsWrites:0,scope:'M4 read-only refresh; all original declarations/identities unchanged; four exact Team tables inventoried',migrationPreparationTables:4};
validateLedger(l);fs.writeFileSync(ledgerPath,JSON.stringify(l,null,2)+'\n');renderReports(l);
const statusPath='docs/architecture/domain-migration-status.json',s=read(statusPath),team=s.domains.find(d=>d.owner==='TEAM_HUB');
s.scope='Ntgre; M4 targeted read-only refresh and offline preparation; no AWS writes';s.currentPhase='M4 / 2B3 preparation; BLOCKED for AWS write review';s.awsChanges=0;
team.phase='M4_PREPARATION_BLOCKED';team.gitCheckpoint='4591f326de5c8ef6f09fc0b3a3d459d5d0d8580f';team.lastVerified=l.latestReadOnlyReview.at;
team.blockers=['External/privileged writer coverage unresolved; reader audit incomplete','Source backup/PITR/deletion protection absent; restore unproved','All-path server fence not installed/rehearsed','Durable schema, privacy visibility and audit retention need approval','Post-business-write reverse mapping and timed rollback unproved','Dark-target execution-policy/change-set/audit gate not prepared'];
team.nextStep='Resolve M4 blockers; separately review exact source protection and dark-target writes. No migration/cutover authorization.';
team.evidence=[...new Set([...team.evidence,'docs/architecture/team-hub-2b3-dark-target-readiness.md',E+'/table-inventory.json',E+'/team-baseline.json'])];
fs.writeFileSync(statusPath,JSON.stringify(s,null,2)+'\n');
save('ledger-update',{previousAssigned:2430,previousUnresolvedShared:191,newAssigned:2430,newUnresolvedShared:191,resourcesWithAdditionalEvidence:192,tablesMigrationPrep:4,migrated:0,retired:0,ownerChanges:0,awsWrites:0});
console.log(JSON.stringify({tableStatuses:4,ownershipChanged:false}));
