import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {read,E} from './read-only.mjs';
import {validateLedger} from '../migration/ledger.mjs';
const inventory=read(E+'/table-inventory.json'),logos=read(E+'/logo-inventory.json');
assert.equal(inventory.complete,true);assert.equal(inventory.tables.length,4);
for(const t of inventory.tables){assert.equal(t.first.paginationCompleted,true);assert.equal(t.second.paginationCompleted,true);assert.equal(t.first.consistentRead,true);assert.equal(t.second.consistentRead,true);assert.equal(t.first.count,0);assert.equal(t.second.count,0);}
assert.equal(logos.count,0);assert.equal(logos.paginationCompleted,true);
assert.equal(read(E+'/team-baseline.json').unchanged,true);assert.deepEqual(read(E+'/tournament-baseline.json').issues,[]);assert.equal(read(E+'/legacy-after.json').beforeAfterEqual,true);
const ledger=read('docs/architecture/legacy-resource-ownership.json');const counts=validateLedger(ledger);assert.equal(counts.total,2621);assert.equal(counts.unresolvedShared,191);assert.equal(ledger.resources.filter(r=>r.migrationStatus==='MIGRATION_PREP').length,4);assert.equal(counts.migrated,0);assert.equal(counts.retired,0);
const team=read('docs/architecture/domain-migration-status.json').domains.find(d=>d.owner==='TEAM_HUB');assert.equal(team.phase,'M4_PREPARATION_READY_FOR_WRITE_GATES');assert.equal(team.businessDataMigrated,false);assert.equal(team.frontendCutover,false);assert.equal(team.legacyAuthority,true);
let links=0;for(const p of ['docs/architecture/team-hub-2b3-state-inventory.md','docs/architecture/team-hub-2b3-recovery-plan.md','docs/architecture/team-hub-2b3-migration-plan.md','docs/architecture/team-hub-2b3-dark-target-readiness.md','scripts/team-hub-migration/README.md']){for(const m of fs.readFileSync(p,'utf8').matchAll(/\]\(([^)]+)\)/g)){const target=m[1].split('#')[0];if(!target||/^https?:/.test(target))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(p),target)),p+' -> '+target);links++;}}
const evidenceFiles=fs.readdirSync(E).filter(p=>p.endsWith('.json'));for(const p of evidenceFiles)read(E+'/'+p);
console.log(JSON.stringify({evidenceJsonFiles:evidenceFiles.length,localLinks:links,ledger:counts.total,prepTables:4,migrated:0,retired:0,preparationReadyForSeparateGates:true,readyForExecution:false}));
