import assert from 'node:assert/strict';
// Offline resource-policy preparation, not a Legacy source/CloudFormation change.
export function legacyFencePolicies(mode,sources,existing={}){
 assert.ok(['LEGACY_WRITER','FROZEN','TARGET_WRITER'].includes(mode));
 const expected=['PlayerChampionPoolEntry','Team','TeamMembership','TeamRosterSlot'].map(n=>`arn:aws:dynamodb:eu-north-1:058264289478:table/${n}-dxb2tdlulrch7hj2pts2mfijia-NONE`).sort();assert.deepEqual([...sources].sort(),expected);
 return sources.map(arn=>{const policy=structuredClone(existing[arn]??{Version:'2012-10-17',Statement:[]});if(policy.Statement.some(s=>s.Sid==='TeamHubMigrationWriterFence'))throw Error('Existing fence requires explicit transition review');if(mode!=='LEGACY_WRITER')policy.Statement.push({Sid:'TeamHubMigrationWriterFence',Effect:'Deny',Principal:'*',Action:['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:BatchWriteItem','dynamodb:PartiQLInsert','dynamodb:PartiQLUpdate','dynamodb:PartiQLDelete'],Resource:arn});return {arn,policy,install:false};});
}
