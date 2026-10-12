import assert from 'node:assert/strict';
import {aws,read,save,B,X,E,Q} from './aws.mjs';
const window=read(E+'/window.json'),before=new Date(Date.parse(window.start)-1000).toISOString(),inside=new Date(Date.parse(window.start)+60000).toISOString();
const policy=JSON.parse(JSON.stringify(read(Q+'/recovery-policy.template.json')).replaceAll('${NotBefore}',window.start).replaceAll('${ExpiresAt}',window.end));
const prior=JSON.parse(JSON.stringify(read(B+'/recovery-policy.template.json')).replaceAll('${NotBefore}',window.start).replaceAll('${ExpiresAt}',window.end));
const cases=read(X+'/security-validation.json').checks.map(c=>({...c,context:{...c.context,'aws:CurrentTime':c.label==='before'?before:c.label==='at expiry'?window.end:inside}}));
const baseline=read(B+'/inspection.json'),context=cases[0].context;
const add=(label,action,resource,expected,extra={})=>cases.push({label,action,resource,expected,context:{...context,...extra}});
for(const f of baseline.functions){const arn=f.actual.FunctionArn;
 add(f.kind+' $LATEST update','lambda:UpdateFunctionConfiguration',arn+':$LATEST','allowed');
 add(f.kind+' $LATEST read remains ungranted','lambda:GetFunctionConfiguration',arn+':$LATEST','implicitDeny');
 for(const suffix of [':1',':99',':production',':live',':LATEST',':$LATEST-extra'])for(const action of ['lambda:UpdateFunctionConfiguration','lambda:GetFunctionConfiguration'])add(f.kind+suffix+action,action,arn+suffix,'explicitDeny');
 for(const suffix of ['',':$LATEST'])for(const action of ['lambda:UpdateFunctionCode','lambda:CreateFunction','lambda:DeleteFunction','lambda:PublishVersion','lambda:UpdateAlias','lambda:AddPermission','lambda:InvokeFunction'])add(f.kind+suffix+action,action,arn+suffix,'explicitDeny');
 for(const foreign of [arn.replace('Ntgre','Production'),arn.replace('058264289478','000000000000'),arn.replace('eu-north-1','us-east-1'),arn+'-other'])add('foreign '+foreign,'lambda:UpdateFunctionConfiguration',foreign+':$LATEST','explicitDeny');
 add(f.kind+' qualified before','lambda:UpdateFunctionConfiguration',arn+':$LATEST','explicitDeny',{'aws:CurrentTime':before});
 add(f.kind+' qualified expiry','lambda:UpdateFunctionConfiguration',arn+':$LATEST','explicitDeny',{'aws:CurrentTime':window.end});
}
const result={at:new Date().toISOString(),checks:[],priorControls:[],analyzer:[],complete:false,awsWrites:0,liveProof:false,window:'Simulation fixture only; fresh execution window required'};
async function simulate(c,p){const out=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(p)],ActionNames:[c.action],ResourceArns:[c.resource],ContextEntries:Object.entries(c.context).filter(([,v])=>v!==null).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:ContextKeyName==='aws:CurrentTime'?'date':'string'}))});const e=out.EvaluationResults[0];assert.equal(e.EvalDecision,c.expected,c.label);return {...c,decision:e.EvalDecision,matchedStatements:e.MatchedStatements,missingContext:e.MissingContextValues};}
for(let n=0;n<cases.length;n+=5){const batch=await Promise.allSettled(cases.slice(n,n+5).map(c=>simulate(c,policy)));for(const item of batch){if(item.status==='rejected')throw item.reason;result.checks.push(item.value);}save('security-validation',result);}
for(const f of baseline.functions)result.priorControls.push(await simulate({label:'Failed policy '+f.kind,action:'lambda:UpdateFunctionConfiguration',resource:f.actual.FunctionArn+':$LATEST',expected:'explicitDeny',context},prior));
for(const [name,document,type,resource] of [['policy',policy,'IDENTITY_POLICY'],['trust',read(B+'/recovery-trust.json'),'RESOURCE_POLICY','AWS::IAM::AssumeRolePolicyDocument']]){
 const a=await aws('accessanalyzer','validate-policy',{policyDocument:JSON.stringify(document),policyType:type,...(resource?{validatePolicyResourceType:resource}:{})});assert.ok(!a.nextToken);result.analyzer.push({name,findings:a.findings??[]});assert.ok(!(a.findings??[]).some(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)));
}
result.definition=await aws('stepfunctions','validate-state-machine-definition',{definition:JSON.stringify(read(B+'/recovery-workflow.json')),type:'STANDARD',severity:'WARNING'});assert.equal(result.definition.result,'OK');
result.template=await aws('cloudformation','validate-template',{TemplateBody:JSON.stringify(read(Q+'/recovery-security.template.json'))});
result.complete=true;save('security-validation',result);console.log(JSON.stringify({complete:true,checks:result.checks.length,priorControls:result.priorControls.length,analyzer:result.analyzer,workflow:result.definition.result}));
