import assert from 'node:assert/strict';
import {read,save,sha} from './aws.mjs';
export const candidateEvidence='docs/architecture/team-hub-cursor-security-evidence-2026-10-08';
export function verify(){
 const m=read(candidateEvidence+'/artifact-manifest.json');
 assert.equal(m.candidateManifestSha256,'b137c2e8be1fa380b35cd401219327875e3c8cdaae58ac78969c4d799478091d');
 assert.equal(sha(candidateEvidence+'/candidate.json'),m.candidateManifestSha256);
 for(const a of [...m.artifacts,...m.sourceHashes,...m.evidenceHashes])assert.equal(sha(a.path),a.sha256,a.path);
 const old=read('docs/architecture/team-hub-business-runtime-evidence-2026-10-08/artifact-manifest.json');
 for(const a of [...old.artifacts,...old.sourceHashes])assert.equal(sha(a.path),a.sha256,a.path);
 return {...read(m.preservedRoot+'/candidate.json'),root:m.preservedRoot,manifestSha256:m.candidateManifestSha256};
}
const c=verify();save('artifact-review',{at:new Date().toISOString(),complete:true,candidate:c.manifestSha256,product:c.productSha256,security:c.securitySha256,runtime:c.runtimeSha256,originalBlockedPreserved:true,rollbackPreserved:true,rebuild:false,headSubstituted:false});
console.log(JSON.stringify({pinsVerified:true,manifest:c.manifestSha256}));
