import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const E='docs/architecture/team-hub-maintenance-preparation-evidence-2026-10-12';
const documents=['README-PHASE2-MIGRATION.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md','team-hub-2b6-final-maintenance-preparation.md'];
const missing=[];let links=0;
for(const file of documents){const p='docs/architecture/'+file,s=fs.readFileSync(p,'utf8');for(const match of s.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){let target=match[1];if(/^(https?:|mailto:|#)/.test(target))continue;target=target.split('#')[0];if(!target)continue;links++;if(!fs.existsSync(path.resolve(path.dirname(p),target)))missing.push({file,target});}}
const patterns=[['AWS_KEY',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],['JWT',/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/],['PRIVATE_KEY',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['GITHUB_TOKEN',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['SECRET_VALUE',/["'](?:SecretAccessKey|SessionToken|password|client_secret|refresh_token|access_token|id_token)["']\s*:\s*["'][^"'\s]{12,}["']/i]];
const findings=[];let artifactFiles=0;
for(const build of JSON.parse(fs.readFileSync(E+'/frontend-pins.json')).builds){const manifest=JSON.parse(fs.readFileSync(build.manifest));for(const f of manifest.files){artifactFiles++;const s=fs.readFileSync(path.join(build.preservedArtifactDirectory,f.path),'utf8');for(const[name,re]of patterns)if(re.test(s))findings.push({build:build.kind,file:f.path,pattern:name});}}
const result={at:new Date().toISOString(),links,missing,artifactFiles,findings,complete:missing.length===0&&findings.length===0,awsWrites:0};fs.writeFileSync(E+'/final-checks.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));assert.ok(result.complete);
