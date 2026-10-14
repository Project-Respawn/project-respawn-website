import assert from 'node:assert/strict';
export function resourceResults(response,actions,resources){
 assert.ok(!response.IsTruncated,'Uncollected IAM results');
 const rows=response.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(r=>({action:x.EvalActionName,resource:r.EvalResourceName,decision:r.EvalResourceDecision,missing:r.MissingContextValues??x.MissingContextValues??[]})):[{action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision,missing:x.MissingContextValues??[]}]);
 assert.equal(rows.length,actions.length*resources.length,'Every action/resource pair must be present');
 for(const action of actions)for(const resource of resources)assert.equal(rows.filter(x=>x.action===action&&x.resource===resource).length,1,'Missing or duplicate resource result');
 return rows.sort((a,b)=>(a.action+a.resource).localeCompare(b.action+b.resource));
}
