import assert from 'node:assert/strict';
export const account='058264289478',region='eu-north-1',team='ProjectRespawn-TeamHub-Ntgre',core='ProjectRespawn-Core-Ntgre';
export const coreArn=`arn:aws:lambda:${region}:${account}:function:${core}-Contracts`;
export const coreInvokeResources=Object.freeze([coreArn,coreArn+':$LATEST']);
export const op=`arn:aws:dynamodb:${region}:${account}:table/${team}-Operational`,journal=op.replace('Operational','Journal');
const statement=(Effect,Action,Resource,Condition)=>({Effect,Action,Resource,...(Condition?{Condition}:{})});
const keys=values=>({'ForAllValues:StringLike':{'dynamodb:LeadingKeys':values},Null:{'dynamodb:LeadingKeys':'false'}});
export function teamPolicy(base,kind){
 const p=structuredClone(base),command=kind==='Command';
 p.Statement=p.Statement.filter(s=>s.Action&&(Array.isArray(s.Action)?s.Action:[s.Action]).every(a=>/^(logs:|kms:)/.test(a)));
 // Retain accepted logging and default-service KMS constraints, then rebuild data scope.
 p.Statement.unshift({Effect:'Deny',NotAction:['logs:CreateLogStream','logs:PutLogEvents','kms:Decrypt','dynamodb:GetItem','dynamodb:Query',...(command?['dynamodb:PutItem','dynamodb:DeleteItem','dynamodb:ConditionCheckItem']:[]),'lambda:InvokeFunction','secretsmanager:GetSecretValue'],Resource:'*'});
 p.Statement.push(statement('Allow',['dynamodb:GetItem','dynamodb:Query'],op,keys(['TEAM#team:*','SLUG#*'])),statement('Allow','dynamodb:Query',[op+'/index/BySubject',op+'/index/ByTeamStatus'],keys(['SUBJECT#*','STATUS#*'])),statement('Allow','dynamodb:GetItem',journal,keys(['CONTROL#AUTHORITY',...(command?['IDEMP#*']:[])])));
 if(command)p.Statement.push(statement('Allow',['dynamodb:PutItem','dynamodb:DeleteItem'],op,{...keys(['TEAM#team:*','SLUG#*']),'ForAnyValue:StringEquals':{'dynamodb:EnclosingOperation':['TransactWriteItems']}}),statement('Allow','dynamodb:ConditionCheckItem',[op,journal],keys(['TEAM#team:*','SLUG#*','CONTROL#AUTHORITY'])),statement('Allow','dynamodb:PutItem',journal,{...keys(['TEAM#team:*','IDEMP#*']),'ForAnyValue:StringEquals':{'dynamodb:EnclosingOperation':['TransactWriteItems']}}));
 p.Statement.push({Effect:'Deny',Action:'dynamodb:*',NotResource:[op,op+'/index/BySubject',op+'/index/ByTeamStatus',journal]},statement('Allow','lambda:InvokeFunction',coreInvokeResources),{Effect:'Deny',Action:'lambda:*',NotResource:coreInvokeResources},statement('Allow','secretsmanager:GetSecretValue',`arn:aws:secretsmanager:${region}:${account}:secret:${team}-Cursor-??????`));
 assert.ok(JSON.stringify(p).length<=6144);return p;
}
export function corePolicy(kmsStatements,poolId){
 const pool=`arn:aws:cognito-idp:${region}:${account}:userpool/${poolId}`,log=`arn:aws:logs:${region}:${account}:log-group:/project-respawn/Ntgre/core/contracts:*`;
 return {Version:'2012-10-17',Statement:[{Effect:'Deny',NotAction:['logs:CreateLogStream','logs:PutLogEvents','kms:Decrypt','cognito-idp:AdminGetUser','cognito-idp:AdminListGroupsForUser','cognito-idp:ListUsers','secretsmanager:GetSecretValue'],Resource:'*'},...structuredClone(kmsStatements),statement('Allow',['logs:CreateLogStream','logs:PutLogEvents'],log),statement('Allow',['cognito-idp:AdminGetUser','cognito-idp:AdminListGroupsForUser','cognito-idp:ListUsers'],pool),{Effect:'Deny',Action:'cognito-idp:*',NotResource:pool},statement('Allow','secretsmanager:GetSecretValue',`arn:aws:secretsmanager:${region}:${account}:secret:${core}-Cursor-??????`)]};
}
