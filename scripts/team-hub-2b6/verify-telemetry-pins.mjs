import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07/gate-d',P='docs/architecture/team-hub-2b5b-evidence-2026-10-07';
const read=p=>JSON.parse(fs.readFileSync(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const c=read(E+'/candidate.json'),old=read(P+'/candidate.json'),revision=read(E+'/source-revision.json');
assert.equal(sha(P+'/candidate.json'),c.previousCandidate.sha256);
for(const [root,candidate]of [[E,c],[P,old]]){assert.equal(sha(candidate.runtimePath),candidate.runtimeSha256);for(const k of ['product','security'])assert.equal(sha(root+'/'+k+'-candidate.template.json'),candidate[k+'Sha256']);}
for(const f of old.sourceHashes){const r=revision.changes.find(x=>x.path===f.path);assert.equal(sha(r?E+'/previous-source/'+f.path.split('/').at(-1):f.path),f.sha256);}
for(const f of [...c.sourceHashes,...read(E+'/frontend-source-manifest.json').files])assert.equal(sha(f.path),f.sha256,f.path);
const product=read(E+'/product-candidate.template.json'),previous=read(P+'/product-candidate.template.json');
for(const kind of ['Command','Read'])previous.Resources['Parity'+kind+'Function'].Properties.Code.S3Key=c.runtimeKey;
previous.Resources.Stage.Properties.DefaultRouteSettings.DetailedMetricsEnabled=true;assert.deepEqual(product,previous);
const expected=JSON.parse(JSON.stringify(read(P+'/security-candidate.template.json')).replaceAll('team-hub/2b5b/'+old.runtimeSha256+'.zip',c.runtimeKey).replaceAll('team-hub/2b5b/'+old.productSha256+'.template.json',c.templateKey));
assert.deepEqual(read(E+'/security-candidate.template.json'),expected);
assert.equal(read('config/domains/team-hub/frontend-cutover.PROPOSAL.json').reviewed,false);
fs.writeFileSync(E+'/pins.json',JSON.stringify({at:new Date().toISOString(),pinsVerified:true,previousPreserved:true,runtime:c.runtimeSha256,product:c.productSha256,security:c.securitySha256,runtimePermissionsChanged:false,frontendActivation:false,awsWrites:0},null,2)+'\n');console.log('Telemetry pins and previous candidate verified');
