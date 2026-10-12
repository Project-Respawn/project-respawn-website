import {execFileSync} from 'node:child_process';
import {save} from './aws.mjs';
const r=JSON.parse(execFileSync('aws',['cloudformation','describe-type','--type','RESOURCE','--type-name','AWS::SecretsManager::Secret','--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',windowsHide:true})),s=JSON.parse(r.Schema);save('secret-resource-provider',{at:new Date().toISOString(),arn:r.Arn,defaultVersionId:r.DefaultVersionId,handlers:s.handlers,awsWrites:0});console.log(JSON.stringify(s.handlers));
