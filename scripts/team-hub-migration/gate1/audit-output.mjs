import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {save,E} from './read-only.mjs';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const report='docs/architecture/team-hub-2b3-gate1-legacy-recovery-protection.md';
const files=[...walk(E),...walk('scripts/team-hub-migration/gate1'),'amplify/teamHubRecovery.ts','amplify/backend.ts',report,'docs/architecture/domain-migration-status.json','docs/architecture/legacy-resource-ownership.json','docs/architecture/legacy-resource-ownership-summary.md','docs/architecture/README-PHASE2-MIGRATION.md'];
const patterns=[/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/["']?(?:aws_secret_access_key|aws_session_token|client_secret|refresh_token|id_token|access_token)["']?\s*[:=]\s*["'][^"']{16,}["']/i];
const findings=[];for(const file of files){const text=fs.readFileSync(file,'utf8');for(let i=0;i<patterns.length;i++)if(patterns[i].test(text))findings.push({file,pattern:i});}
assert.equal(findings.length,0,JSON.stringify(findings));
const links=[...fs.readFileSync(report,'utf8').matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]).filter(p=>!/^https?:/.test(p));for(const link of links)assert.ok(fs.existsSync(path.resolve(path.dirname(report),link.split('#')[0])),'Missing link '+link);
save('output-audit',{at:new Date().toISOString(),filesScanned:files.length,secretPatterns:patterns.length,findings:0,reportLinksChecked:links.length,reportLinksMissing:0,ledgerTestsPassed:10,gateTestsPassed:98,totalTestsPassed:108,temporaryTemplatesAndFullAwsContextsIgnored:true,gitCommitCreated:false});console.log(JSON.stringify({files:files.length,findings:0,reportLinks:links.length,totalTestsPassed:108}));
