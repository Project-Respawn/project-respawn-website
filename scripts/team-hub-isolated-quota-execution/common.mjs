import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';
export const E='docs/architecture/team-hub-isolated-quota-execution-evidence-2026-10-12';
export const Q='docs/architecture/team-hub-isolated-quota-evidence-2026-10-12';
export const read=p=>JSON.parse(fs.readFileSync(p));
export const save=(n,x)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(x,null,2)+'\n');
export const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const options={region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1};
export const manifest=read(Q+'/execution-manifest.json'),candidate=read(manifest.candidate.path),template=read(manifest.template.path),name=candidate.stack;
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function verifyPins(){for(const x of [manifest.candidate,manifest.template,manifest.policy,manifest.probe,manifest.sourceClosure,...manifest.sourceHashes])assert.equal(sha(x.path),x.sha256,x.path);assert.equal(manifest.candidate.sha256,'13db6824ce0f661a4b271a38108c706204b886edb5c7e6e39eea68fc2e492a4b');assert.equal(manifest.template.sha256,'62a06af84531336c4067d5a4158575d7a84b2ed9029a4f51765fe34b878a7c9f');}
export function requireGates(){verifyPins();for(const n of ['baseline','protected-after','installed-security-audit','runtime-security','proposal-security','custody','operator-policy','live-endpoint','metrics-latest','capacity-telemetry'])assert.equal(read(E+'/'+n+'.json').complete,true,n);assert.ok(Date.now()-Date.parse(read(E+'/baseline.json').at)<30*60000,'Baseline refresh required');}
export const canonical=x=>JSON.stringify(sort(x));function sort(x){return Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;}
