import assert from 'node:assert/strict';
import {aws,read,save,audit,digest} from './read-only.mjs';
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const previous=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/provider-artifacts.json');
const providers=[];
for(const prior of previous.providers){
 const config=await aws('lambda','get-function-configuration','--function-name',prior.name);
 assert.equal(config.CodeSha256,prior.codeSha256);
 const roleName=config.Role.split('/').at(-1);
 const role=await aws('iam','get-role','--role-name',roleName);
 const inline=await aws('iam','list-role-policies','--role-name',roleName);
 const attached=await aws('iam','list-attached-role-policies','--role-name',roleName);
 const policies=[];
 for(const name of inline.PolicyNames)policies.push(await aws('iam','get-role-policy','--role-name',roleName,'--policy-name',name));
 for(const p of attached.AttachedPolicies){const meta=await aws('iam','get-policy','--policy-arn',p.PolicyArn);policies.push(await aws('iam','get-policy-version','--policy-arn',p.PolicyArn,'--version-id',meta.Policy.DefaultVersionId));}
 providers.push({name:prior.name,codeSha256:config.CodeSha256,roleName,role:role.Role,policies,configurationHash:digest(config)});
}
save('provider-preflight',{at:new Date().toISOString(),identity,providers,audit});
console.log(JSON.stringify(providers.map(p=>({name:p.name,role:p.roleName,boundary:p.role.PermissionsBoundary,policies:p.policies})),null,2));
