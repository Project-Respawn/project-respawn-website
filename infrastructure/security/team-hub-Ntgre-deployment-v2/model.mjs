// Security-only successor. Never imports or synthesizes a product application.
export const target={account:'058264289478',region:'eu-north-1',environment:'Ntgre',stack:'ProjectRespawn-TeamHub-Ntgre'};
export const prefix='arn:aws:apigateway:eu-north-1::';
export const fixtureApiId='thproof123'; // Simulation fixture, NEVER a deployable live binding.
export const verbs=['apigateway:POST','apigateway:PUT','apigateway:PATCH','apigateway:DELETE'];
export function apiPaths(id){
  if(!/^[a-z0-9]{8,12}$/.test(id))throw Error('Invalid API ID');
  const api=prefix+'/apis/'+id;
  const encoded=encodeURIComponent(api),lower=encoded.replace(/%[0-9A-F]{2}/g,s=>s.toLowerCase());
  return [api,api+'/*',prefix+'/tags/'+api,prefix+'/tags/'+api+'/*',prefix+'/tags/'+encoded,prefix+'/tags/'+encoded+'%2F*',prefix+'/tags/'+lower,prefix+'/tags/'+lower+'%2f*'];
}
export function executionPolicy(original,{state,protectedIds,expiresAt,apiId}){
  if(!protectedIds.length||!protectedIds.includes('msipnwy39j')||protectedIds.some(id=>!/^[a-z0-9]{8,12}$/.test(id)))throw Error('Complete protected inventory required');
  const p=structuredClone(original);
  // These two statements are the superseded broad allow and Tournament-only deny.
  if(p.Statement[0].Action!=='apigateway:*'||p.Statement[1].Action!=='apigateway:*')throw Error('Unexpected original policy');
  p.Statement.splice(0,2);
  const resources=['arn:aws:apigateway:*::/restapis*',...protectedIds.map(id=>prefix+'*'+id+'*')];
  // Conservative ID-containing path denies also cover encoded/decoded tag paths.
  const guard={Effect:'Deny',Action:'apigateway:*',Resource:resources};
  if(state==='FIRST_CREATE'){
    if(!Number.isFinite(Date.parse(expiresAt)))throw Error('Fixed expiry required');
    p.Statement.unshift(
      {Effect:'Allow',Action:'apigateway:*',Resource:'*',Condition:{StringEquals:{'aws:RequestedRegion':target.region},DateLessThan:{'aws:CurrentTime':expiresAt}}},
      guard,
      {Effect:'Deny',Action:'apigateway:*',Resource:'*',Condition:{DateGreaterThanEquals:{'aws:CurrentTime':expiresAt}}},
    );
  }else if(state==='STEADY_STATE'){
    if(protectedIds.includes(apiId))throw Error('Protected API cannot become Team API');
    const paths=apiPaths(apiId);
    p.Statement.unshift(
      {Effect:'Allow',Action:'apigateway:*',Resource:paths,Condition:{StringEquals:{'aws:RequestedRegion':target.region}}},
      {Effect:'Deny',Action:'apigateway:*',NotResource:paths},
      guard,
    );
  }else throw Error('Explicit deployment state required');
  return p;
}
export function callerPolicy(templateSha){
  if(!/^[a-f0-9]{64}$/.test(templateSha))throw Error('Pinned product template required');
  const stack=`arn:aws:cloudformation:${target.region}:${target.account}:stack/${target.stack}/*`;
  const role=`arn:aws:iam::${target.account}:role/${target.stack}-ReadProofExecution`;
  const url=`https://cdk-hnb659fds-assets-${target.account}-${target.region}.s3.${target.region}.amazonaws.com/team-hub/read-proof/${templateSha}.template.json`;
  const read=['cloudformation:DescribeChangeSet','cloudformation:DeleteChangeSet','cloudformation:DescribeStacks','cloudformation:DescribeStackEvents','cloudformation:GetTemplate'];
  const actions=[...read,'cloudformation:CreateChangeSet','cloudformation:ExecuteChangeSet','iam:PassRole'];
  return {Version:'2012-10-17',Statement:[
    {Effect:'Deny',NotAction:actions,Resource:'*'},
    {Effect:'Allow',Action:read,Resource:stack},
    {Effect:'Allow',Action:'cloudformation:CreateChangeSet',Resource:stack,Condition:{StringEquals:{'cloudformation:RoleArn':role,'cloudformation:TemplateUrl':url}}},
    {Effect:'Allow',Action:'cloudformation:ExecuteChangeSet',Resource:stack},
    {Effect:'Deny',Action:'cloudformation:*',NotResource:stack},
    {Effect:'Deny',Action:'cloudformation:*',Resource:'*',Condition:{StringNotEquals:{'aws:RequestedRegion':target.region}}},
    {Effect:'Allow',Action:'iam:PassRole',Resource:role,Condition:{StringEquals:{'iam:PassedToService':'cloudformation.amazonaws.com'}}},
    {Effect:'Deny',Action:'iam:PassRole',NotResource:role},
    {Effect:'Deny',Action:'iam:PassRole',Resource:'*',Condition:{StringNotEquals:{'iam:PassedToService':'cloudformation.amazonaws.com'}}},
  ]};
}
