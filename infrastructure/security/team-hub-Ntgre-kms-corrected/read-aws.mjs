import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
export const dir='docs/architecture/team-hub-2b2-kms-correction-evidence-2026-10-05';
export const previous='docs/architecture/team-hub-2b2-security-correction-evidence-2026-10-05';
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export const save=(name,value)=>{fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');};
export async function aws(...args){
 const allowed={sts:['get-caller-identity'],cloudformation:['describe-stack-resource'],kms:['list-keys','list-aliases','describe-key','get-key-policy','list-grants','list-resource-tags'],s3api:['get-bucket-encryption','get-bucket-policy','head-object'],apigatewayv2:['get-apis'],apigateway:['get-rest-apis'],iam:['simulate-custom-policy','simulate-principal-policy'],accessanalyzer:['validate-policy']};
 if(!allowed[args[0]]?.includes(args[1]))throw Error('Read-only review command required');
 const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{maxBuffer:40e6,windowsHide:true});return JSON.parse(stdout);
}
