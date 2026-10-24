import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const root='docs/architecture/team-hub-production-migration-2026-10-24/runtime-candidate';
const bytes=p=>fs.readFileSync(p), read=p=>JSON.parse(bytes(p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const m=read(root+'/candidate.json');

test('immutable candidate and complete source closure match their pins',()=>{
 assert.equal(sha(bytes(root+'/candidate.json')),'861720f095cf8b826a4b399c119f6850c11d2ead30533d0c914f587e1d30cb0f');
 for(const artifact of [m.runtime,m.product,m.security,m.rollback.runtime,m.rollback.product])assert.equal(sha(bytes(artifact.path)),artifact.sha256);
 for(const source of m.sourceClosure)assert.equal(sha(bytes(root+'/source/'+source.path)),source.sha256,source.path);
 assert.equal(m.sourceClosure.length,22);
 assert.equal(m.sourceClosure.filter(s=>s.origin==='PROPOSED_CURRENT_DATA_PARITY').length,4);
 assert.equal(m.authorizationRecorded,false);
});

test('product changes are one route addition and two Code-only modifications',()=>{
 const old=read(m.rollback.product.path), next=read(m.product.path);
 const additions=Object.keys(next.Resources).filter(k=>!old.Resources[k]);
 assert.deepEqual(additions,['ParityRouteSETMYROLES']);
 assert.deepEqual(Object.keys(old.Resources).filter(k=>!next.Resources[k]),[]);
 const modified=Object.keys(old.Resources).filter(k=>JSON.stringify(old.Resources[k])!==JSON.stringify(next.Resources[k]));
 assert.deepEqual(modified.sort(),['ParityCommandFunction','ParityReadFunction']);
 for(const id of modified){const a=structuredClone(old.Resources[id]),b=structuredClone(next.Resources[id]);delete a.Properties.Code;delete b.Properties.Code;assert.deepEqual(a,b);}
 assert.equal(next.Resources.ParityRouteSETMYROLES.Properties.AuthorizationType,'JWT');
 assert.equal(Object.keys(next.Resources).length,42);
});

test('policy budgets and scope remain explicit',()=>{
 assert.equal(m.resources.runtimeIamChanges,0);
 assert.equal(m.resources.environmentChanges,0);
 assert.deepEqual(m.resources.securityModifications,['ExecutionBoundary','ExecutionRole','PreparationCaller','DeploymentCaller']);
 for(const size of Object.values(m.policySizes))assert(size.bytes<=size.limit);
 assert.equal(m.rollback.obsoleteDraftPermissionRetirementRequiresExplicitReview,true);
 assert(m.rollback.afterFirstPreferenceWrite.includes('do not blindly revert'));
 assert(m.policyChanges.every(c=>c.kmsPassRoleAndRuntimePermissionsUnchanged));
});

test('security resource identities, runtime boundaries, KMS and PassRole are preserved',()=>{
 const before=read('docs/architecture/production-team-hub-tagging-recovery-2026-10-24/de13291048f600fefaefd393d3f9d1b623550988465a352bac083815a8244a29.security.template.json');
 const after=read(m.security.path), changed=new Set(m.resources.securityModifications);
 assert.deepEqual(Object.keys(after.Resources),Object.keys(before.Resources));
 for(const [id,r]of Object.entries(before.Resources)){
  if(!changed.has(id)){assert.deepEqual(after.Resources[id],r,id);continue;}
  const a=structuredClone(r),b=structuredClone(after.Resources[id]);
  const policy=x=>x.Type==='AWS::IAM::ManagedPolicy'?x.Properties.PolicyDocument:x.Properties.Policies[0].PolicyDocument;
  const sensitive=d=>d.Statement.filter(s=>[s.Action??s.NotAction].flat().some(x=>typeof x==='string'&&(/^(kms:|iam:PassRole$)/.test(x))));
  assert.deepEqual(sensitive(policy(a)),sensitive(policy(b)),id+' KMS/PassRole');
  if(a.Type==='AWS::IAM::ManagedPolicy'){delete a.Properties.PolicyDocument;delete b.Properties.PolicyDocument;}
  else {delete a.Properties.Policies;delete b.Properties.Policies;}
  assert.deepEqual(a,b,id+' identity/trust/boundary');
 }
});
