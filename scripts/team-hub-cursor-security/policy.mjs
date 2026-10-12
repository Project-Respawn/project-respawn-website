import assert from 'node:assert/strict';
export const secret='arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-??????';
export const conditions={StringEquals:{'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','aws:RequestedRegion':'eu-north-1'},StringLike:{'kms:EncryptionContext:SecretARN':secret}};
export function kmsStatements(key,actions,{guards=true}={}){
 const result=[{Sid:'ExactCursorServiceKey',Effect:'Allow',Action:actions,Resource:key,Condition:structuredClone(conditions)}];
 if(guards){for(const[k,v]of Object.entries(conditions.StringEquals))result.push({Effect:'Deny',Action:actions,Resource:key,Condition:{StringNotEquals:{[k]:v}}});result.push({Effect:'Deny',Action:actions,Resource:key,Condition:{StringNotLike:{'kms:EncryptionContext:SecretARN':secret}}});}
 return result;
}
export function readPolicy(base,key){const p=structuredClone(base),deny=p.Statement.find(s=>s.Effect==='Deny'&&s.Action==='kms:Decrypt'&&s.Condition?.['ForAllValues:StringNotEquals']?.['kms:ResourceAliases']);assert.ok(deny);delete deny.Resource;deny.NotResource=key;
 p.Statement.push(...kmsStatements(key,['kms:Decrypt']),{Effect:'Deny',Action:'secretsmanager:GetSecretValue',NotResource:secret});return p;
}
export function executionPolicy(base,key,boundary=false){const p=structuredClone(base);if(boundary){
 // Exact API deny remains in the execution identity; the boundary has no Allow for foreign APIs.
 // Removing only this duplicated deny funds the conditional KMS grant under the 6144-byte ceiling.
 const i=p.Statement.findIndex(s=>s.Effect==='Deny'&&s.Action==='apigateway:*'&&s.NotResource);assert.ok(i>=0);p.Statement.splice(i,1);
 }
 const grant=kmsStatements(key,['kms:Decrypt','kms:GenerateDataKey'],{guards:!boundary});
 // The AWS-managed key policy independently enforces CallerAccount; the exact key ARN
 // and ViaService bind the region. Keep these conditions in Allow, without duplicate
 // execution-identity denials; explicit service/context denials remain.
 const compact=grant.filter(s=>!(s.Effect==='Deny'&&(s.Condition?.StringNotEquals?.['kms:CallerAccount']||s.Condition?.StringNotEquals?.['aws:RequestedRegion'])));
 p.Statement.push(...compact,{Effect:'Deny',Action:'kms:*',NotResource:key},{Effect:'Deny',NotAction:['kms:Decrypt','kms:GenerateDataKey'],Resource:key},{Effect:'Deny',Action:'secretsmanager:GetSecretValue',NotResource:secret});return p;
}
