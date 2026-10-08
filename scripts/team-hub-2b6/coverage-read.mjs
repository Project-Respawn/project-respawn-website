// Read-only M4 coverage expansion. No mutation, simulation or deployment operations.
import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
export {read,digest,canonical} from '../team-hub-migration/read-only.mjs';
export const F='docs/architecture/team-hub-2b6-evidence-2026-10-07';
fs.mkdirSync(F,{recursive:true});
export const save=(n,v)=>fs.writeFileSync(F+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
const exec=promisify(execFile);
const allow={dynamodb:['get-resource-policy'],s3api:['get-bucket-policy'],sts:['get-caller-identity'],iam:['get-account-authorization-details','get-policy','get-policy-version'],cloudtrail:['describe-trails','get-trail-status','get-event-selectors','list-event-data-stores','lookup-events'],cloudwatch:['get-metric-statistics','describe-alarms'],events:['list-event-buses','list-rule-names-by-target'],scheduler:['list-schedules','get-schedule'],appsync:['get-introspection-schema','list-functions','list-resolvers','get-resolver','list-data-sources','get-data-source'],lambda:['get-function','get-function-configuration','list-functions','list-event-source-mappings'],cloudformation:['get-template','list-stack-resources']};
export const audit={calls:0,errors:[],writes:0};
export async function aws(service,op,...args){if(!allow[service]?.includes(op))throw Error('Operation outside read-only coverage scope');try{audit.calls++;const {stdout}=await exec('aws',[service,op,...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:128e6});return stdout.trim()?JSON.parse(stdout):{};}catch(e){const code=(e.stderr??'').match(/\(([^)]+)\)/)?.[1]??'COMMAND_FAILED';audit.errors.push({service,op,code});throw Error(service+' '+op+' '+code);}}
