import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const allowed={sts:['get-caller-identity'],apigateway:['get-rest-apis'],apigatewayv2:['get-apis'],cloudformation:['list-stacks'],iam:['simulate-custom-policy'],accessanalyzer:['validate-policy']};
export async function aws(...args){
  if(!allowed[args[0]]?.includes(args[1]))throw Error('Read-only review command required');
  const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',maxBuffer:30e6,windowsHide:true});
  return JSON.parse(stdout);
}
