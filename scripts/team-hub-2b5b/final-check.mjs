import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const E='docs/architecture/team-hub-2b5b-evidence-2026-10-07';
const read=p=>JSON.parse(fs.readFileSync(p));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const c=read(E+'/candidate.json'),frontend=read(E+'/frontend-source-manifest.json');
assert.equal(sha(c.runtimePath),c.runtimeSha256);
for(const kind of ['product','security'])assert.equal(sha(E+'/'+kind+'-candidate.template.json'),c[kind+'Sha256']);
assert.equal(sha(E+'/monitoring-candidate.template.json'),c.monitoringSha256);
for(const f of [...c.sourceHashes,...frontend.files])assert.equal(sha(f.path),f.sha256,'Source changed: '+f.path);
assert.equal(read(E+'/rehearsal.json').candidate,c.runtimeSha256);
assert.equal(read(E+'/rehearsal.json').passed,true);
assert.equal(read('config/domains/team-hub/frontend-cutover.PROPOSAL.json').reviewed,false);
const build=read(E+'/frontend-candidate-build.json');
const teamChunk=build.chunks.find(c=>c.file.includes('TeamHubHome'));assert.ok(teamChunk);
const pages=teamChunk.domainModules.filter(p=>!p.endsWith('.routes.js'));
assert.ok(pages.some(p=>p.endsWith('cutover-client.mjs')));
assert.ok(!pages.some(p=>p.endsWith('teamHub.service.js')||/features\/(tournaments|creator-tools|commerce|community)\//.test(p)));
for(const chunk of build.chunks.filter(c=>c.file.includes('Tournament')))
 assert.ok(!chunk.domainModules.filter(p=>!p.endsWith('.routes.js')).some(p=>/features\/(Team Hub|team-hub)\//.test(p)));
const reports=['team-hub-2b5b-final-cutover-readiness.md','team-hub-2b5b-writer-fence-proof.md','team-hub-2b5b-frontend-acceptance.md','team-hub-2b5b-rollback-rehearsal-result.md','team-hub-2b6-cutover-runbook.md'].map(p=>'docs/architecture/'+p);
const broken=[];let links=0;for(const p of reports)for(const m of fs.readFileSync(p,'utf8').matchAll(/\]\(([^)]+)\)/g)){if(/^(https?:|#)/.test(m[1]))continue;links++;if(!fs.existsSync(path.resolve(path.dirname(p),m[1].split('#')[0])))broken.push({file:p,target:m[1]});}assert.deepEqual(broken,[]);
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?d.name==='node_modules'?[]:walk(path.join(p,d.name)):[path.join(p,d.name)]);}
const files=[...new Set([...walk(E),...walk('scripts/team-hub-2b5b'),...reports,...c.sourceHashes.map(f=>f.path),...frontend.files.map(f=>f.path),'scripts/team-hub-2b5/security.mjs','scripts/team-hub/tests/security-isolation.test.mjs'])];
const patterns=[['AWS_ACCESS_KEY',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],['PRIVATE_KEY',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['JWT_LITERAL',/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/],['CREDENTIAL_LITERAL',/\b(?:aws_secret_access_key|aws_session_token)\s*[=:]\s*["']?[A-Za-z0-9/+]{20,}/i]];
const findings=[];for(const p of files){const s=fs.readFileSync(p,'utf8');for(const [kind,re]of patterns)if(re.test(s))findings.push({file:p,kind});}
assert.deepEqual(findings,[],'Credential-pattern findings require review; values intentionally omitted');
const receipt={at:new Date().toISOString(),artifactHashes:true,sourcePins:true,staticBundleIsolation:true,browserNetworkAcceptance:'PENDING',linksChecked:links,brokenLinks:broken,secretScan:{files:files.length,findings,scope:'Current candidate/evidence/frontend/task scripts only; pattern scan is not a guarantee for all unrelated workspace files'},authorityChanged:false,frontendActivation:false,productionTouched:false};
fs.writeFileSync(E+'/final-check.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
