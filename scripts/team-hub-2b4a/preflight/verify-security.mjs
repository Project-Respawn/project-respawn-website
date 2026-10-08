import assert from 'node:assert/strict';
import {aws,product,security,read,save,E,digest} from './aws.mjs';
const desired=read(E+'/security.template.json');
const stack=(await aws('cloudformation','describe-stacks',['--stack-name',security])).Stacks[0];assert.equal(stack.StackStatus,'UPDATE_COMPLETE');assert.equal(stack.DisableRollback,false);
const t=await aws('cloudformation','get-template',['--stack-name',security]);assert.equal(digest(typeof t.TemplateBody==='string'?JSON.parse(t.TemplateBody):t.TemplateBody),digest(desired));
const resources=(await aws('cloudformation','list-stack-resources',['--stack-name',security])).StackResourceSummaries;assert.equal(resources.length,5);
const roles=[];
for(const [suffix,id]of [['ReadProofExecution','ExecutionBoundary'],['Deploy','PreparationCaller'],['PreviewRead','PreviewBoundary']]){
 const name=product+'-'+suffix,role=(await aws('iam','get-role',['--role-name',name])).Role;
 const arn=role.PermissionsBoundary.PermissionsBoundaryArn,p=(await aws('iam','get-policy',['--policy-arn',arn])).Policy;
 const doc=(await aws('iam','get-policy-version',['--policy-arn',arn,'--version-id',p.DefaultVersionId])).PolicyVersion.Document;
 assert.equal(digest(doc),digest(desired.Resources[id].Properties.PolicyDocument));
 const attached=(await aws('iam','list-attached-role-policies',['--role-name',name])).AttachedPolicies;
 const names=(await aws('iam','list-role-policies',['--role-name',name])).PolicyNames;
 if(suffix==='Deploy'){assert.equal(attached.length,1);assert.equal(attached[0].PolicyArn,arn);assert.equal(names.length,0);assert.deepEqual(role.AssumeRolePolicyDocument,desired.Resources.DeploymentCaller.Properties.AssumeRolePolicyDocument);}
 else{assert.equal(attached.length,0);assert.equal(names.length,1);const inline=(await aws('iam','get-role-policy',['--role-name',name,'--policy-name',names[0]])).PolicyDocument;const expected=suffix==='ReadProofExecution'?desired.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument:read(E+'/product.template.json').Resources.ReadRole.Properties.Policies[0].PolicyDocument;assert.equal(digest(inline),digest(expected));}
 roles.push({name,arn,document:doc,defaultVersion:p.DefaultVersionId});
}
save('security-installed',{at:new Date().toISOString(),verified:true,stack,resources,roles,runtimeUnchanged:true,callerTemplatePinned:true});console.log(JSON.stringify({verified:true,resources:5,runtimeUnchanged:true}));
