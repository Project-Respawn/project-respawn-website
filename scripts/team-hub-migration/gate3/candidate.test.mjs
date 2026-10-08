import test from 'node:test';
import assert from 'node:assert/strict';
import {read,E} from './read-only.mjs';
const p=read(E+'/product.template.json'),s=read(E+'/security.template.json'),c=read(E+'/candidate.json');
const original=read('docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05/lockdown-security.template.json');
test('caller change is solely an exact template URL/key substitution',()=>{
 const before=JSON.stringify(original.Resources.PreparationCaller);
 const after=JSON.stringify(s.Resources.PreparationCaller);
 assert.equal(after,before.replaceAll(c.originalTemplateUrl,c.url).replaceAll(c.originalTemplateUrl.split('.amazonaws.com/')[1],c.key));
});
test('deployment trust and preview permissions remain accepted',()=>{for(const n of ['PreviewBoundary','DeploymentCaller'])assert.deepEqual(s.Resources[n],original.Resources[n]);assert.deepEqual(s.Resources.ExecutionRole.Properties.AssumeRolePolicyDocument,original.Resources.ExecutionRole.Properties.AssumeRolePolicyDocument);});
test('all eleven live product declarations unchanged; two native protected additions only',()=>{const prior=read('docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05/ownership.json').productTemplate;for(const [k,v]of Object.entries(prior.Resources))assert.deepEqual(p.Resources[k],v);assert.equal(Object.keys(p.Resources).length,13);for(const n of ['OperationalTable','JournalTable']){assert.equal(p.Resources[n].Type,'AWS::DynamoDB::Table');assert.equal(p.Resources[n].DeletionPolicy,'Retain');assert.equal(p.Resources[n].UpdateReplacePolicy,'Retain');assert.equal(p.Resources[n].Properties.DeletionProtectionEnabled,true);}});
test('caller and runtime gain no data access; execution remains exact reviewed lifecycle only',()=>{const proposed=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/dark-security.template.json');for(const n of ['ExecutionRole','ExecutionBoundary'])assert.deepEqual(s.Resources[n],proposed.Resources[n]);assert.equal(Object.keys(s.Resources).length,5);});
