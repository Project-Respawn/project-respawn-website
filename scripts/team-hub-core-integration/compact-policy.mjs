import assert from 'node:assert/strict';
export function compactExecutionBoundary(policy){
 const p=structuredClone(policy),regionDeny=p.Statement.find(s=>s.Effect==='Deny'&&s.Resource==='*'&&s.Condition?.StringNotEquals?.['aws:RequestedRegion']==='eu-north-1');
 assert.ok(regionDeny);let removed=0;
 for(const s of p.Statement){
  if(s.Effect==='Allow'&&JSON.stringify(s.Condition)===JSON.stringify({StringEquals:{'aws:RequestedRegion':'eu-north-1'}})){
   const actions=Array.isArray(s.Action)?s.Action:[s.Action];
   assert.ok(actions.every(a=>regionDeny.Action.includes(a.split(':')[0]+':*')));
   // Exact duplicate region requirement: explicit Deny applies to all these actions,
   // including absent region context. Removing this Allow condition cannot bypass it.
   delete s.Condition;removed++;
  }
 }
 assert.equal(removed,2);
 const unconditional=p.Statement.filter(s=>s.Effect==='Deny'&&s.Resource==='*'&&!s.Condition&&!s.NotAction&&!s.NotResource);
 assert.equal(unconditional.length,2);const [first,second]=unconditional;
 first.Action=[...new Set([first.Action,second.Action].flat())];p.Statement=p.Statement.filter(s=>s!==second);
 assert.ok(JSON.stringify(p).length<=6144);return p;
}
