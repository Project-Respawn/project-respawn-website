import assert from 'node:assert/strict';
export function validateDeleteRequest(request,probe){
 assert.match(probe.operation,/^delete(?:Team|TeamMembership|TeamRosterSlot|PlayerChampionPoolEntry)$/);
 assert.match(probe.variables.input.id,/^__team_hub_fence_probe_20261012_/);
 assert.equal(request.operation,'DeleteItem');assert.equal(request.key.id.S,probe.variables.input.id);
 const and=probe.variables.condition?.and;assert.equal(and?.length,2);
 const [a,b]=and.map(x=>Object.entries(x)[0]);assert.equal(a[0],b[0]);assert.equal(a[1].attributeExists,true);assert.equal(b[1].attributeExists,false);
 assert.ok(request.condition.expression.includes('attribute_exists('));assert.ok(request.condition.expression.includes('attribute_not_exists('));assert.ok(request.condition.expression.includes('AND'));
 return true;
}
export function requireDeleteFenceReceipt(receipt,pin){
 assert.equal(receipt.installedFenceHashVerified,true);assert.equal(receipt.sourceKeyAbsentBefore,true);assert.equal(receipt.sourceKeyAbsentAfter,true);assert.equal(receipt.sourceBusinessDigestUnchanged,true);
 assert.equal(receipt.operation,pin.operation);assert.ok(receipt.appsyncRequestId);assert.equal(receipt.httpStatus,200);
 const errors=receipt.errors??[];assert.ok(errors.length>0,'Null is not fence denial');
 const roleName=pin.dataSourceRoleArn.split('/').at(-1);
 const qualifying=errors.filter(e=>{const m=e.message??'';return /AccessDenied|not authorized/.test(m)&&m.includes('dynamodb:DeleteItem')&&m.includes(pin.tableArn)&&m.includes(':assumed-role/'+roleName+'/')&&/explicit deny.*resource[- ]based policy/i.test(m)&&!/ConditionalCheckFailed|ValidationException|GetItem/.test(m);});
 assert.equal(qualifying.length,1,'Require one exact original datasource/table DeleteItem resource-policy denial');
 assert.ok(/DynamoDB/.test(qualifying[0].type??''),'AppSync caller rejection is not datasource evidence');
 return true;
}
