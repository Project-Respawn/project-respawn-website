import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const E='docs/architecture/core-artifact-evidence-2026-10-06';
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(p+'/'+d.name):[p+'/'+d.name]);}
const docs=['core-template-security-correction.md','core-first-deployment-readiness.md','core-domain-plan.md','core-release1-acceptance.md','README-PHASE2-MIGRATION.md'].map(n=>'docs/architecture/'+n);
const files=[...walk('scripts/core-artifact'),...walk(E),...docs,'docs/architecture/domain-migration-status.json'].filter(p=>!p.endsWith('/output-check.json'));
const secrets=[/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/,/aws_secret_access_key\s*[=:]\s*[A-Za-z0-9/+]{30,}/i];
for(const p of files){const text=fs.readFileSync(p,'utf8');assert.ok(!secrets.some(r=>r.test(text)),'Credential pattern found: '+p);}
let links=0;for(const p of docs){const text=fs.readFileSync(p,'utf8');for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const href=m[1].split('#')[0];if(!href||/^(https?:|mailto:)/.test(href))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(p),href)),'Broken link '+p+': '+href);links++;}}
const result={at:new Date().toISOString(),secretPatternScan:'PASS',filesScanned:files.length,localLinksChecked:links,files:files.map(p=>({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')})),awsWrites:0};
fs.writeFileSync(E+'/output-check.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({secretPatternScan:'PASS',files:files.length,links}));
