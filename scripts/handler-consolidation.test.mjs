import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const schema=readFileSync('amplify/data/resource.ts','utf8');
test('custom handlers use the two retained infrastructure anchors',()=>{
  assert.equal((schema.match(/a\.handler\.function\('FnSubmitInvestorAccessRequest'\)/g)||[]).length,71);
  assert.equal((schema.match(/a\.handler\.function\('FnReviewInvestorAccessRequest'\)/g)||[]).length,8);
  assert.doesNotMatch(schema,/a\.handler\.function\((myFunction|adminUserManagement)\)/);
  assert.match(schema,/functions:\s*\{\s*FnSubmitInvestorAccessRequest: myFunction,\s*FnReviewInvestorAccessRequest: adminUserManagement,/);
});
test('Team Hub remains two authenticated gateway fields routed through the shared handler',()=>{
  for(const field of ['readTeamHub','mutateTeamHub']) {
    const block=schema.slice(schema.indexOf(field+':'),schema.indexOf(".handler(a.handler.function('FnSubmitInvestorAccessRequest'))",schema.indexOf(field+':'))+80);
    assert.match(block,/allow\.authenticated\(\)/);assert.match(block,/FnSubmitInvestorAccessRequest/);
  }
});
