import assert from 'node:assert/strict';
import fs from 'node:fs';
import {aws,read,save,pins,pinned,dir,equal} from './common.mjs';
pins();const t=read(pinned+'/first-create-security.template.json'),name='ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity';
const stack=(await aws('cloudformation','describe-stacks','--stack-name',name)).Stacks[0];assert.equal(stack.StackStatus,'CREATE_COMPLETE');assert.equal(stack.DisableRollback,false);
const resources=(await aws('cloudformation','list-stack-resources','--stack-name',name)).StackResourceSummaries;assert.equal(resources.length,4);
const policies={};for(const id of ['PreviewBoundary','ExecutionBoundary','PreparationCaller']){const r=resources.find(r=>r.LogicalResourceId===id);assert.equal(r.ResourceStatus,'CREATE_COMPLETE');const policy=(await aws('iam','get-policy','--policy-arn',r.PhysicalResourceId)).Policy;const document=(await aws('iam','get-policy-version','--policy-arn',policy.Arn,'--version-id',policy.DefaultVersionId)).PolicyVersion.Document;equal(document,t.Resources[id].Properties.PolicyDocument);policies[id]={policy,document};}
const role=(await aws('iam','get-role','--role-name',t.Resources.ExecutionRole.Properties.RoleName)).Role;equal(role.AssumeRolePolicyDocument,t.Resources.ExecutionRole.Properties.AssumeRolePolicyDocument);assert.equal(role.PermissionsBoundary.PermissionsBoundaryArn,policies.ExecutionBoundary.policy.Arn);
const names=(await aws('iam','list-role-policies','--role-name',role.RoleName)).PolicyNames;assert.deepEqual(names,['ReadProofLifecycle']);const inline=(await aws('iam','get-role-policy','--role-name',role.RoleName,'--policy-name',names[0])).PolicyDocument;equal(inline,t.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument);equal(inline,policies.ExecutionBoundary.document);
const attached=(await aws('iam','list-attached-role-policies','--role-name',role.RoleName)).AttachedPolicies;assert.equal(attached.length,0);
save('installed-security',{at:new Date().toISOString(),stack,resources,policies,role,inline,attached,canonicalEquivalent:true});
const vd=dir+'/installed-validation';fs.mkdirSync(vd,{recursive:true});
for(const f of ['manifest','key-inventory','artifact-encryption','steady-state-fixture-policy'])fs.copyFileSync(pinned+'/'+f+'.json',vd+'/'+f+'.json');
fs.writeFileSync(vd+'/first-create-policy.json',JSON.stringify(inline,null,2));fs.writeFileSync(vd+'/deployment-caller-policy.json',JSON.stringify(policies.PreparationCaller.document,null,2));
let helper=fs.readFileSync('infrastructure/security/team-hub-Ntgre-kms-corrected/read-aws.mjs','utf8').replace("export const dir='"+pinned+"'","export const dir='"+vd+"'");fs.writeFileSync(vd+'/read-aws.mjs',helper);fs.copyFileSync('infrastructure/security/team-hub-Ntgre-kms-corrected/validate.mjs',vd+'/validate.mjs');
console.log('Installed security: exact canonical equivalence; four resources; execution identity/boundary equal; no attached execution policies. Full validation prepared using installed documents.');
