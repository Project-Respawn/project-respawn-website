import assert from 'node:assert/strict';
import {capture} from './inventory.mjs';
import {read,save,windowGate,retryRead as aws,manifest,E} from './live-common.mjs';
windowGate();
const {report}=await capture(),old=read('docs/architecture/team-hub-production-migration-2026-10-24/fresh-inventory.json');
for(const source of report.sources){const previous=old.sources.find(s=>s.model===source.model);assert.equal(source.count,previous.count,'SOURCE_COUNT_DRIFT '+source.model);assert.equal(source.digest,previous.digest,'SOURCE_DIGEST_DRIFT '+source.model);}
const authority=(await aws('dynamodb','get-item',{TableName:'ProjectRespawn-TeamHub-Production-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true})).Item;
assert.equal(authority.schemaVersion.S,'team-hub-authority.v1');assert.equal(authority.mode.S,'LEGACY_WRITER');assert.equal(authority.epoch.N,'1');assert.equal(authority.version.N,'1');
const expectedTables={Operational:'237479de-3af4-4d79-b5ef-e697f5b70236',Journal:'c5af2b45-a9cb-4da3-95ce-2eea97e9751d'};
for(const[k,id]of Object.entries(expectedTables)){const t=(await aws('dynamodb','describe-table',{TableName:'ProjectRespawn-TeamHub-Production-'+k})).Table;assert.equal(t.TableId,id);}
const capacity=await aws('lambda','get-account-settings');assert(capacity.AccountLimit.UnreservedConcurrentExecutions>0);
const routes=(await aws('apigatewayv2','get-routes',{ApiId:'9wk4a41l5m'}));assert(!routes.NextToken);assert.equal(routes.Items.length,19);assert(routes.Items.every(r=>r.AuthorizationType==='JWT'));
const authorizers=await aws('apigatewayv2','get-authorizers',{ApiId:'9wk4a41l5m'});assert.equal(authorizers.Items.length,1);assert.equal(authorizers.Items[0].JwtConfiguration.Issuer,manifest.environment.issuer);assert.deepEqual(authorizers.Items[0].JwtConfiguration.Audience,[manifest.environment.clientId]);
save('preflight.json',{...report,authority,capacity,baselineRoutes:routes.Items.map(r=>({routeKey:r.RouteKey,authorization:r.AuthorizationType})),passed:true,awsWrites:0});
console.log(JSON.stringify({passed:true,counts:report.sources.map(s=>[s.model,s.count]),authority:report.target.authority,routes:routes.Items.length,evidence:E+'/preflight.json',awsWrites:0}));
