import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {hash,pins,read,expiry,equal} from '../../../docs/architecture/team-hub-2b2-release-execution-evidence-2026-10-05/common.mjs';
export {read,expiry,equal,hash};
export const dir='docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05';
export const save=(n,v)=>fs.writeFileSync(dir+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
export function verify(){pins();const c=read(dir+'/candidate.json');for(const f of c.files)assert.equal(hash(f.path),f.sha256);return c;}
const exec=promisify(execFile);
export async function aws(...args){const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:40e6});return stdout.trim()?JSON.parse(stdout):{};}
export async function callerSession(){const c=verify();const result=await aws('sts','assume-role','--role-arn',c.caller,'--role-session-name','TeamHubReviewedRelease1','--duration-seconds','900');const credentials=result.Credentials;const env={...process.env,AWS_ACCESS_KEY_ID:credentials.AccessKeyId,AWS_SECRET_ACCESS_KEY:credentials.SecretAccessKey,AWS_SESSION_TOKEN:credentials.SessionToken};delete env.AWS_PROFILE;delete env.AWS_DEFAULT_PROFILE;
 return async(...args)=>{try{const {stdout}=await exec('aws',[...args,'--region','eu-north-1','--output','json','--no-cli-pager'],{env,windowsHide:true,maxBuffer:40e6});return stdout.trim()?JSON.parse(stdout):{};}catch(e){throw Error('Restricted caller command failed: '+args.slice(0,2).join(' ')+'; '+(e.stderr??'').slice(0,2000));}};
}
