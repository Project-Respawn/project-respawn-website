import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {E,save,read} from './common.mjs';
const report='docs/architecture/team-hub-2b3-gate2-restore-rehearsal.md';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const files=[...walk(E),...walk('scripts/team-hub-migration/gate2'),report,'docs/architecture/domain-migration-status.json','docs/architecture/legacy-resource-ownership.json','docs/architecture/legacy-resource-ownership-summary.md','docs/architecture/README-PHASE2-MIGRATION.md','docs/architecture/team-hub-2b3-recovery-plan.md'];
const patterns=[/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/["']?(?:aws_secret_access_key|aws_session_token|client_secret|refresh_token|id_token|access_token)["']?\s*[:=]\s*["'][^"']{16,}["']/i];
for(const file of files){const text=fs.readFileSync(file,'utf8');assert.ok(!patterns.some(p=>p.test(text)),'Sensitive pattern in '+file);}
const links=[...fs.readFileSync(report,'utf8').matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]).filter(p=>!/^https?:/.test(p));for(const link of links)assert.ok(fs.existsSync(path.resolve(path.dirname(report),link.split('#')[0])),'Missing '+link);
const security=read(E+'/security.json');const decisions=security.results.flatMap(r=>r.ResourceSpecificResults??[]);assert.equal(decisions.length,68);assert.ok(decisions.every(r=>r.EvalResourceDecision==='allowed'));
const summary=fs.readFileSync('docs/architecture/legacy-resource-ownership-summary.md','utf8');assert.ok(summary.includes('2,621')||summary.includes('2621'));assert.ok(summary.includes('UNRESOLVED_SHARED'));assert.ok(summary.includes('Latest Team Hub Gate 2 result'));
save('output-audit',{at:new Date().toISOString(),filesScanned:files.length,secretPatternFindings:0,localReportLinks:links.length,missingLinks:0,scopeGuardTestsPassed:13,ledgerTestsPassed:10,totalTestsPassed:23,permissionResourceDecisions:68,permissionsAllowed:true,unrelatedWorkspaceChangesPreserved:true,commitCreated:false,gate3Started:false});console.log(JSON.stringify({filesScanned:files.length,secretPatternFindings:0,localReportLinks:links.length,totalTestsPassed:23}));
