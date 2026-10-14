import {test} from 'node:test';import assert from 'node:assert/strict';import {requireDrain,cleanupAllowed,lateCommitModel,proposal} from './two-blockers.mjs';
const valid={issuanceClosed:true,newRequestsDenied:true,completeRequestCensus:true,nonterminalRequests:0,multipartCount:0,privilegedCustody:true,reconciled:true};
test('complete terminal drain requires every independent requirement',()=>assert.equal(requireDrain(valid),true));
for(const field of ['issuanceClosed','newRequestsDenied','completeRequestCensus','privilegedCustody','reconciled'])test('missing '+field+' fails closed',()=>assert.throws(()=>requireDrain({...valid,[field]:false})));
test('running single-part upload blocks even with no multipart uploads',()=>assert.throws(()=>requireDrain({...valid,nonterminalRequests:1})));
test('unresolved multipart blocks',()=>assert.throws(()=>requireDrain({...valid,multipartCount:1})));
test('expiry/fence/listing cannot imply physical commit impossible',()=>assert.equal(lateCommitModel().commitAfterBoundary,true));
test('cleanup exact terminal synthetic object only',()=>assert.equal(cleanupAllowed({owned:true,key:'synthetic',digest:'abc'},{key:'synthetic',digest:'abc',terminal:true}),true));
for(const change of [{key:'business'},{digest:'other'},{terminal:false}])test('cleanup rejects '+JSON.stringify(change),()=>assert.throws(()=>cleanupAllowed({owned:true,key:'synthetic',digest:'abc'},{key:'synthetic',digest:'abc',terminal:true,...change})));
test('restricted helper cannot edit fence or read foreign secrets',()=>{const p=proposal(),deny=p.policy.Statement.find(s=>s.Effect==='Deny');for(const a of ['s3:PutBucketPolicy','ssm:*','kms:*','iam:*'])assert.ok(deny.Action.includes(a));assert.equal(p.resourceInventory.length,2);});
test('restricted DynamoDB partition must be present and exact',()=>{const c=proposal().policy.Statement[0].Condition;assert.equal(c.Null['dynamodb:LeadingKeys'],'false');assert.equal(c['ForAllValues:StringEquals']['dynamodb:LeadingKeys'].length,1);});
test('restricted replacement does not mislabel original-role proof',()=>assert.match(proposal().limitations[0],/not original/));

