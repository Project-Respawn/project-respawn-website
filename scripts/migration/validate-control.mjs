// Offline structure, arithmetic, milestone and local documentation-link checks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {read,ledgerPath,validateLedger,owners} from './ledger.mjs';
const coverage=validateLedger(read(ledgerPath));
const s=read('docs/architecture/domain-migration-status.json');
assert.equal(s.domains.length,8);assert.equal(new Set(s.domains.map(d=>d.owner)).size,8);
const required=['domain','classification','owner','phase','architectureStatus','awsStatus','stack','api','dataStatus','frontendStatus','legacyAuthority','gitCheckpoint','blockers','nextStep','lastVerified','evidence'];
for(const d of s.domains){for(const k of required)assert.ok(Object.hasOwn(d,k),d.domain+' missing '+k);assert.ok(owners.includes(d.owner));assert.ok(Array.isArray(d.blockers));for(const p of d.evidence)assert.ok(fs.existsSync(p));if(d.awsStatus==='NOT_EXTRACTED'){assert.equal(d.stack,null);assert.equal(d.api,null);}assert.equal(d.legacyAuthority,true);}
const files=['README.md','AGENTS.md','docs/architecture/README.md','docs/architecture/README-PHASE2-MIGRATION.md','docs/architecture/domain-migration-template.md','docs/architecture/phase2-documentation-index.md','docs/architecture/legacy-resource-ownership-summary.md','docs/architecture/legacy-resource-ownership.md','docs/maintenance/phase2-document-retention.md','docs/architecture/team-hub-2b2-read-path-release1-2026-10-05.md','docs/architecture/domain-deployment-selection.md','docs/architecture/independent-domain-deployment-callers.md'];
let links=0;const missing=[];
for(const p of files){const t=fs.readFileSync(p,'utf8');for(const m of t.matchAll(/\]\(([^)]+)\)/g)){const raw=m[1].split('#')[0].replace(/^<|>$/g,'');if(!raw||/^(https?:|mailto:)/.test(raw))continue;if(p==='README.md'&&!raw.startsWith('docs/architecture/'))continue;const target=path.resolve(path.dirname(p),decodeURIComponent(raw));if(!fs.existsSync(target))missing.push({from:p,target:raw});links++;}}
assert.deepEqual(missing,[],'Broken current documentation links');
const template=fs.readFileSync('docs/architecture/domain-migration-template.md','utf8');
for(let n=0;n<=8;n++){const section=template.split(new RegExp('## M'+n+'\\b'))[1]?.split(/\n## M/)[0];assert.ok(section,'Missing M'+n);for(const field of ['ENTRY CRITERIA','ALLOWED CHANGES','PROHIBITED CHANGES','REQUIRED TESTS','AWS GATE','ROLLBACK','EXIT CRITERIA','EVIDENCE'])assert.ok(section.includes(field),'M'+n+' missing '+field);}
console.log(JSON.stringify({statusDomains:8,documentationFiles:files.length,localLinks:links,coverage,awsCalls:0}));
