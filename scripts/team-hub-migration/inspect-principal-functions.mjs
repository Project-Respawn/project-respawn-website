import {aws,read,save,audit} from './final-read.mjs';
const i=await aws('sts','get-caller-identity');if(i.Account!=='058264289478')throw Error('Wrong account');
const p=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/iam-coverage.json');
const policy=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/logo-resource-policy.json');
const roles=new Set(p.principals.filter(p=>p.arn.includes('amplify-projectrespawnweb-')).map(p=>p.arn));
for(const s of policy.policy.Statement)if(s.Effect==='Allow'&&typeof s.Principal?.AWS==='string')roles.add(s.Principal.AWS);
const functions=(await aws('lambda','list-functions')).Functions;
save('principal-functions',{at:new Date().toISOString(),enumerated:functions.length,functions:functions.filter(f=>roles.has(f.Role)).map(f=>({name:f.FunctionName,arn:f.FunctionArn,role:f.Role,codeSha256:f.CodeSha256,lastModified:f.LastModified,timeout:f.Timeout,runtime:f.Runtime})),environmentValuesPersisted:false,audit});
console.log(JSON.stringify({mapped:functions.filter(f=>roles.has(f.Role)).length,audit}));
