import assert from 'node:assert/strict';
export const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);
export const policySize=p=>JSON.stringify(p).replace(/\s/g,'').length;
export function optimize(template){
 const out=structuredClone(template),identity=out.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument,boundary=out.Resources.ExecutionBoundary.Properties.PolicyDocument;
 const changes=[];
 // Sids are labels, not authorization predicates. Keep the transformation receipt.
 for(const [i,s]of identity.Statement.entries())if(s.Sid){changes.push({kind:'REMOVE_LABEL',oldIndex:i,sid:s.Sid});delete s.Sid;}
 // Union identical Effect/Resource/Condition statements only. No cross-products.
 const merged=[];
 for(const [i,s]of identity.Statement.entries()){
  const base=structuredClone(s);delete base.Action;
  const previous=s.Action===undefined?undefined:merged.find(x=>x.Action!==undefined&&canonical(Object.fromEntries(Object.entries(x).filter(([k])=>k!=='Action')))===canonical(base));
  if(previous){previous.Action=[...new Set([previous.Action].flat().concat([s.Action].flat()))];changes.push({kind:'UNION_IDENTICAL_PREDICATES',oldIndex:i,effect:s.Effect,resource:s.Resource,condition:s.Condition??null});}
  else merged.push(structuredClone(s));
 }
 identity.Statement=merged;
 // PassRole's outside-target explicit denial is identical in the identity policy.
 // The boundary has no other PassRole allow; foreign targets remain implicitly denied
 // even if an extra identity Allow is injected. The paired result stays explicitDeny.
 const deny=boundary.Statement.find(s=>s.Effect==='Deny'&&s.Action==='iam:PassRole'&&s.NotResource);
 assert.ok(deny);assert.ok(identity.Statement.some(s=>canonical(s)===canonical(deny)));
 const allows=boundary.Statement.filter(s=>s.Effect==='Allow'&&[s.Action].flat().includes('iam:PassRole'));
 assert.equal(allows.length,1);assert.deepEqual(allows[0].Resource,deny.NotResource);
 assert.deepEqual(allows[0].Condition,{StringEquals:{'iam:PassedToService':'lambda.amazonaws.com'}});
 assert.ok(boundary.Statement.filter(s=>s.Effect==='Allow'&&s!==allows[0]).every(s=>[s.Action].flat().every(a=>a!=='iam:*'&&a!=='*'&&a!=='iam:Pass*')));
 boundary.Statement=boundary.Statement.filter(s=>s!==deny);
 changes.push({kind:'REMOVE_REDUNDANT_BOUNDARY_DENY',statement:deny,retainedIdentityDeny:true,retainedBoundaryExactAllow:true,standaloneBoundaryForeignDecision:'implicitDeny',pairedForeignDecision:'explicitDeny'});
 return {template:out,changes};
}
