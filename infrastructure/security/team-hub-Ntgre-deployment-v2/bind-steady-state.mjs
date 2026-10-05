import crypto from 'node:crypto';
import {target,fixtureApiId} from './model.mjs';
// Pure offline binding. A future authorized operator must obtain fresh AWS readback
// evidence, review its provenance, then inspect the two-policy security-stack update.
// This module cannot call AWS or apply a policy.
export function bindSteadyState(parameterizedTemplate,manifest,inventory,ownership){
  const {identity,region,stack,resources,api,productTemplate}=ownership;
  if(identity?.Account!==target.account||region!==target.region||stack?.StackName!==target.stack||!stack.StackId?.startsWith(`arn:aws:cloudformation:${target.region}:${target.account}:stack/${target.stack}/`)||!['CREATE_COMPLETE','UPDATE_COMPLETE'].includes(stack.StackStatus))throw Error('Wrong or unverified Team stack');
  if(!Array.isArray(resources)||resources.length!==11)throw Error('Expected eleven product identities');
  const apis=resources.filter(r=>r.ResourceType==='AWS::ApiGatewayV2::Api');
  if(apis.length!==1||apis[0].LogicalResourceId!=='HttpApi'||apis[0].PhysicalResourceId!==api?.ApiId||api.Name!==target.stack||api.ProtocolType!=='HTTP')throw Error('API ownership mismatch');
  const id=api.ApiId;
  if(!/^[a-z0-9]{8,12}$/.test(id)||id===fixtureApiId||inventory.protectedIds.includes(id))throw Error('Protected/fixture API cannot be bound');
  // AWS GetTemplate JSON formatting is not byte stable: compare canonical structures
  // with the byte-pinned local template, supplied as manifest.productTemplateBody.
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  if(!manifest.productTemplateBody||JSON.stringify(stable(productTemplate))!==JSON.stringify(stable(manifest.productTemplateBody)))throw Error('Deployed product template is not the pinned product');
  const resolve=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===1&&typeof v['Fn::Sub']==='string'&&v['Fn::Sub'].includes('${TeamHubApiId}')?v['Fn::Sub'].replaceAll('${TeamHubApiId}',id):Array.isArray(v)?v.map(resolve):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolve(x)])):v;
  const result=resolve(structuredClone(parameterizedTemplate));delete result.Parameters.TeamHubApiId;
  if(!Object.keys(result.Parameters).length)delete result.Parameters;
  return {apiId:id,template:result,sha256:crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex'),awsWrites:0};
}
