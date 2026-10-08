import assert from 'node:assert/strict';import {aws,identity,json,save,P,B,product,pin} from './aws.mjs';
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));const candidate=pin(),result={at:new Date().toISOString(),identity:await identity(),phase,analyzer:[],checks:[],complete:false};const persist=()=>save(phase==='before'?'policy-review':'actual-security',result);persist();
const p=json(P+'/c2-product.template.json'),s=json(P+'/c2-security.template.json');
if(phase==='before'){
 const old=json(B+'/security.template.json').Resources.PreparationCaller;const strip=v=>Array.isArray(v)?v.filter(x=>x!==candidate.url&&x!=='arn:aws:s3:::'+candidate.bucket+'/'+candidate.key).map(strip):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,strip(x)])):v;assert.deepEqual(strip(s.Resources.PreparationCaller),old);
 for(const id of ['ParityCommandBoundary','ParityReadBoundary','PreparationCaller']){const policy=s.Resources[id].Properties.PolicyDocument;assert.ok(JSON.stringify(policy).length<=6144);const r=await aws('accessanalyzer','validate-policy',{policyDocument:JSON.stringify(policy),policyType:'IDENTITY_POLICY'});result.analyzer.push({id,findings:r.findings});persist();assert.equal(r.findings.filter(x=>['ERROR','SECURITY_WARNING'].includes(x.findingType)).length,0);}
}
const table='arn:aws:dynamodb:eu-north-1:058264289478:table/'+product+'-Journal',ctx=keys=>[{ContextKeyName:'dynamodb:LeadingKeys',ContextKeyValues:keys,ContextKeyType:'stringList'}];
for(const kind of ['Read','Command']){
 const name=product+'-Parity'+kind,role=(await aws('iam','get-role',{RoleName:name})).Role,doc=p.Resources['Parity'+kind+'Role'].Properties.Policies[0].PolicyDocument;
 const cases=[
 ['authority',['dynamodb:GetItem'],[table],ctx(['CONTROL#AUTHORITY']),true],
 ['wrong-partition',['dynamodb:GetItem'],[table],ctx(['AUDIT#other']),false],
 ['mixed-partitions',['dynamodb:GetItem'],[table],ctx(['CONTROL#AUTHORITY','TEAM#other']),false],
 ['missing-key',['dynamodb:GetItem'],[table],[],false],
 ['writes-and-list',['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:Query','dynamodb:Scan','dynamodb:BatchGetItem','dynamodb:BatchWriteItem'],[table],ctx(['CONTROL#AUTHORITY']),false],
 ['transaction-writes',['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem'],[table],[...ctx(['CONTROL#AUTHORITY']),{ContextKeyName:'dynamodb:EnclosingOperation',ContextKeyValues:['TransactWriteItems'],ContextKeyType:'string'}],false],
 ['foreign-data',['dynamodb:GetItem'],[table.replace('-Journal','-Operational'),'arn:aws:dynamodb:eu-north-1:058264289478:table/LegacyTeam','arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-Core-Ntgre','arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-Tournaments-Ntgre'],ctx(['CONTROL#AUTHORITY']),false],
 ['core',['lambda:InvokeFunction'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts:$LATEST'],[],true],
 ['foreign-lambda',['lambda:InvokeFunction'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Tournaments-Ntgre-Preview','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Production-Contracts'],[],false],
 ['own-logs',['logs:CreateLogStream','logs:PutLogEvents'],['arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/team-hub/parity-'+kind.toLowerCase()+':*'],[],true],
 ['foreign-logs',['logs:PutLogEvents'],['arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/core:*'],[],false],
 ['other-services',['secretsmanager:GetSecretValue','cognito-idp:AdminGetUser','cognito-idp:AdminAddUserToGroup','iam:PassRole','kms:Encrypt','logs:PutResourcePolicy','s3:PutObject','appsync:GraphQL'],['*'],[],false],
 ['business-kms',['kms:Decrypt'],['arn:aws:kms:eu-north-1:058264289478:key/00000000-0000-0000-0000-000000000000'],[{ContextKeyName:'kms:ResourceAliases',ContextKeyValues:['alias/business'],ContextKeyType:'stringList'}],false]
 ];
 for(let offset=0;offset<cases.length;offset+=4) await Promise.all(cases.slice(offset,offset+4).map(async ([label,actions,resources,context,expected])=>{for(const mode of phase==='before'?['actual','candidate']:['actual']){
  const r=await aws('iam',mode==='actual'?'simulate-principal-policy':'simulate-custom-policy',{...(mode==='actual'?{PolicySourceArn:role.Arn}:{PolicyInputList:[JSON.stringify(doc)],PermissionsBoundaryPolicyInputList:[JSON.stringify(s.Resources['Parity'+kind+'Boundary'].Properties.PolicyDocument)]}),ActionNames:actions,ResourceArns:resources,...(context.length?{ContextEntries:context}:{})});
  const decisions=r.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({action:x.EvalActionName,resource:y.EvalResourceName,decision:y.EvalResourceDecision,missing:y.MissingContextValues??x.MissingContextValues??[]})):[{action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision,missing:x.MissingContextValues??[]}]);
  const allow=label==='authority'&&phase==='before'&&mode==='actual'?false:expected;result.checks.push({role:name,label,mode,expectedAllowed:allow,decisions});persist();assert.equal(decisions.length,actions.length*resources.length);for(const d of decisions)assert.equal(d.decision==='allowed',allow,kind+' '+label+' '+mode+' '+d.action);
 }}));
}
result.complete=true;persist();console.log(JSON.stringify({phase,complete:true,decisions:result.checks.flatMap(x=>x.decisions).length,analyzerPolicies:result.analyzer.length}));
