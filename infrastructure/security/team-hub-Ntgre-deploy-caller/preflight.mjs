import assert from 'node:assert/strict';
import {aws,read,save,verify,expiry,equal} from './common.mjs';
const c=verify(),identity=await aws('sts','get-caller-identity');assert.equal(identity.Arn,c.operator);
const name='ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity';const stack=(await aws('cloudformation','describe-stacks','--stack-name',name)).Stacks[0];assert.equal(stack.StackStatus,'CREATE_COMPLETE');assert.equal(stack.DisableRollback,false);
const template=(await aws('cloudformation','get-template','--stack-name',name)).TemplateBody;equal(typeof template==='string'?JSON.parse(template):template,read('docs/architecture/team-hub-2b2-kms-correction-evidence-2026-10-05/first-create-security.template.json'));
const installed=read('docs/architecture/team-hub-2b2-release-execution-evidence-2026-10-05/installed-security.json');
for(const [id,p] of Object.entries(installed.policies)){const current=(await aws('iam','get-policy','--policy-arn',p.policy.Arn)).Policy;const doc=(await aws('iam','get-policy-version','--policy-arn',current.Arn,'--version-id',current.DefaultVersionId)).PolicyVersion.Document;equal(doc,p.document);}
const inline=(await aws('iam','get-role-policy','--role-name','ProjectRespawn-TeamHub-Ntgre-ReadProofExecution','--policy-name','ReadProofLifecycle')).PolicyDocument;equal(inline,installed.inline);
for(const target of ['ProjectRespawn-TeamHub-Ntgre'])try{await aws('cloudformation','describe-stacks','--stack-name',target);throw Error('Product unexpectedly exists');}catch(e){if(!/does not exist/.test(e.stderr??''))throw e;}
try{await aws('iam','get-role','--role-name','ProjectRespawn-TeamHub-Ntgre-Deploy');throw Error('Caller already exists');}catch(e){if(!/NoSuchEntity/.test(e.stderr??''))throw e;}
save('preflight',{at:new Date().toISOString(),identity,stack,baseTemplateEquivalent:true,basePoliciesEquivalent:true,callerAbsent:true,productAbsent:true,time:expiry()});console.log('Pinned security live equivalence PASS; caller/product absent; account and expiry PASS.');
