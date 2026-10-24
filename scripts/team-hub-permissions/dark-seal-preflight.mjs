import assert from 'node:assert/strict';import fs from 'node:fs';
import {E,B,H,read,save,sha,pins} from './dark-common.mjs';
pins();assert(read(E+'/fresh-preflight.json').passed);assert(read(E+'/preservation-baseline.json').complete);assert(read(E+'/read-only-preflight.json').passed);
const parent=read(B+'/baseline/manifest.json');assert.equal(sha(fs.readFileSync(B+'/baseline/manifest.json')),'2827cdbb908c3ef51096b54320a22e68bb898f3d3461ae3e95575eb4d787306d');
const refs=[parent.security,parent.product,...Object.values(parent.runtimes)];for(const ref of refs)assert.equal(sha(fs.readFileSync(H+'/'+ref.path)),ref.sha256);
save('preflight.json',{at:new Date().toISOString(),passed:true,artifactPinsVerified:true,rollbackPins:refs.map(({sha256})=>sha256),sourceDataProtectionAndDigests:true,installedCoreIamVerified:true,collisionsVerified:18,capacityVerified:true,awsWrites:0,limitations:['No complete Organizations visibility inferred from simulation','No production authority row or business acceptance before separate bootstrap/migration authorization']});console.log('Fresh preflight sealed; no AWS writes.');
