import assert from 'node:assert/strict';
import {aws,read,save,E,digest} from './read-only.mjs';
const baseline=read('docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05/ownership.json');
const api=await aws('apigatewayv2','get-api','--api-id','t54b88casf');assert.equal(digest(api),digest(baseline.api));
const lambda=await aws('lambda','get-function-configuration','--function-name','ProjectRespawn-TeamHub-Ntgre-PreviewRead');
const desired=read(E+'/product.template.json').Resources.ReadFunction.Properties;
assert.equal(lambda.CodeSha256,'uROMTdppYqBarFWhso61iQVCTQdVRmm8vCNVR3KRWVA=');assert.equal(lambda.State,'Active');assert.equal(lambda.LastUpdateStatus,'Successful');assert.deepEqual(lambda.Environment.Variables,desired.Environment.Variables);assert.equal(lambda.Role,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-PreviewRead');
const routes=await aws('apigatewayv2','get-routes','--api-id','t54b88casf');assert.equal(routes.Items.length,1);assert.equal(routes.Items[0].RouteKey,'GET /v1/team-hub/preview');assert.equal(routes.Items[0].AuthorizationType,'JWT');
save('runtime-after',{at:new Date().toISOString(),api,lambda,routes,unchanged:true});console.log(JSON.stringify({api:'t54b88casf',syntheticPreviewUnchanged:true,mutationRoutes:0}));
