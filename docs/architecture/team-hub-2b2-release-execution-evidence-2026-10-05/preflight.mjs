import assert from 'node:assert/strict';
import {aws,save,pins,expiry} from './common.mjs';
const candidates=pins(),time=expiry();save('pins',candidates);
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');assert.equal(identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const stacks={};for(const name of ['ProjectRespawn-TeamHub-Ntgre','ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity']){try{stacks[name]=(await aws('cloudformation','describe-stacks','--stack-name',name)).Stacks;throw Error('Unexpected existing stack '+name);}catch(e){if(!/Stack with id .* does not exist/.test(e.stderr??''))throw e;stacks[name]='ABSENT';}}
const roles=(await aws('iam','list-roles')).Roles.filter(r=>r.RoleName.startsWith('ProjectRespawn-TeamHub-Ntgre'));const policies=(await aws('iam','list-policies','--scope','Local')).Policies.filter(r=>r.PolicyName.startsWith('ProjectRespawn-TeamHub-Ntgre'));assert.equal(roles.length,0);assert.equal(policies.length,0);
const apis=(await aws('apigatewayv2','get-apis')).Items;assert.equal(apis.filter(a=>/TeamHub/i.test(a.Name)).length,0);
save('preflight',{identity,region:'eu-north-1',time,candidates,stacks,roles,policies,apis,awsWrites:0});console.log(JSON.stringify({identity,time,stacks,teamRoles:roles.length,teamPolicies:policies.length}));
