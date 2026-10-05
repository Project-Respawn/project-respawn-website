import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
export const dir='docs/architecture/team-hub-2b2-release-execution-evidence-2026-10-05';
export const pinned='docs/architecture/team-hub-2b2-kms-correction-evidence-2026-10-05';
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export const save=(n,v)=>fs.writeFileSync(dir+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
export const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export const equal=(a,b)=>assert.deepEqual(stable(a),stable(b));
export async function aws(...args){const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:40e6});return stdout.trim()?JSON.parse(stdout):{};}
export function expiry(){const at=new Date(),expiresAt='2026-10-06T13:51:32.179Z',hours=(Date.parse(expiresAt)-at.getTime())/36e5;assert.ok(hours>=6,'TEAM HUB FIRST-CREATE AUTHORITY RENEWAL REQUIRED');return {at:at.toISOString(),expiresAt,hoursRemaining:hours,minimumHours:6};}
export function pins(){const m=read(pinned+'/manifest.json');assert.equal(m.revision,'3e5a12edf9074bb8dc8d7bf0d83783b641aefc3973514e08aa4cc80f530050de');for(const f of [...m.artifacts,...m.sources])assert.equal(hash(f.path),f.sha256,f.path);assert.equal(crypto.createHash('sha256').update(JSON.stringify({previous:m.previousRevision,product:m.productRevision,artifacts:m.artifacts,sources:m.sources})).digest('hex'),m.revision);assert.equal(hash(pinned+'/first-create-security.template.json'),'df55507efb69188c92309c30632d3d2795c8945fb631306f18a6934f1abaf2f2');const p=read('infrastructure/domains/team-hub/.build/offline-1791205212119/receipt.json');assert.equal(p.revision,'d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f');assert.equal(p.inputs.length,54);for(const f of [...p.inputs,...p.templates,...p.closure.flatMap(c=>c.outputs)])assert.equal(hash(f.path),f.sha256,f.path);return {security:m.revision,product:p.revision,securityTemplate:hash(pinned+'/first-create-security.template.json'),productTemplate:hash(m.productTemplate.path),sources:p.inputs.length,lambdaOutputs:p.closure.flatMap(c=>c.outputs),headSubstitution:false,freshSynthesis:false};}
