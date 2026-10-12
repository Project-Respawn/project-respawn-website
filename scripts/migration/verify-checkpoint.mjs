// Offline verification of accepted recovery bytes, including portable archived cache inputs.
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {sha256} from './deployment-checks.mjs';
const staged=process.argv.includes('--staged'),q='docs/architecture/team-hub-describekey-evidence-2026-10-12/';
const bytes=p=>staged?execFileSync('git',['show',':'+p],{maxBuffer:30e6}):fs.readFileSync(p);
const read=p=>JSON.parse(bytes(p)),m=read(q+'artifact-manifest.json'),v=read(q+'validation-manifest.json'),archive=read('docs/architecture/team-hub-accepted-recovery-artifacts/archive-manifest.json');
const business=read('docs/architecture/team-hub-business-runtime-evidence-2026-10-08/candidate.json');
const pins=[...m.artifacts,...m.preservedArtifacts,...(m.historicalPreservedArtifacts??[]),...v.artifacts,...business.sourceHashes];
for(const pin of pins){const copy=archive.artifacts.find(x=>x.path===pin.path);if(copy)assert.equal(copy.sha256,pin.sha256);assert.equal(sha256(bytes(copy?.archive??pin.path)),pin.sha256,pin.path);}
for(const a of archive.artifacts)assert.equal(sha256(bytes(a.archive)),a.sha256,a.archive);
assert.equal(m.candidateSha256,'9a1bc835b48782cf4bb8df5fbcfb9f138e64ea74a579a0fdec0a8ba507254969');
assert.equal(read('docs/architecture/team-hub-describekey-execution-evidence-2026-10-12/accepted.json').complete,true);
console.log(JSON.stringify({complete:true,staged,pins:pins.length,archived:archive.artifacts.length,awsCalls:0}));
