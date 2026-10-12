import assert from 'node:assert/strict';
export const op='arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational',journal=op.replace('Operational','Journal'),secret='arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-??????';
const keys=v=>({'ForAllValues:StringLike':{'dynamodb:LeadingKeys':v},Null:{'dynamodb:LeadingKeys':'false'}});
const allow=(Action,Resource,Condition)=>({Effect:'Allow',Action,Resource,...(Condition?{Condition}:{})});
export function runtimePolicy(base,kind){
 const p=structuredClone(base),command=kind==='Command';
 const ceiling=p.Statement.find(s=>s.NotAction);ceiling.Sid='OnlyAuthorityGatedTeamRuntime';ceiling.NotAction.push('dynamodb:Query',...(command?['dynamodb:PutItem','dynamodb:DeleteItem','dynamodb:ConditionCheckItem']:['secretsmanager:GetSecretValue']));
 p.Statement.push(allow(['dynamodb:GetItem','dynamodb:Query'],op,keys(['TEAM#team:*','SLUG#*'])));
 if(!command)p.Statement.push(allow('dynamodb:Query',[op+'/index/BySubject',op+'/index/ByTeamStatus'],keys(['SUBJECT#*','STATUS#*'])),allow('secretsmanager:GetSecretValue',secret));
 if(command){const tx={'ForAnyValue:StringEquals':{'dynamodb:EnclosingOperation':['TransactWriteItems']}};p.Statement.push(allow('dynamodb:GetItem',journal,keys(['IDEMP#*'])),allow(['dynamodb:PutItem','dynamodb:DeleteItem'],op,{...keys(['TEAM#team:*','SLUG#*']),...tx}),allow('dynamodb:ConditionCheckItem',op,keys(['TEAM#team:*','SLUG#*'])),allow('dynamodb:ConditionCheckItem',journal,keys(['CONTROL#AUTHORITY'])),allow('dynamodb:PutItem',journal,{...keys(['TEAM#team:*','IDEMP#*']),...tx}));}
 p.Statement.push({Effect:'Deny',Action:'dynamodb:*',NotResource:[op,journal,...(!command?[op+'/index/BySubject',op+'/index/ByTeamStatus']:[])]});
 assert.ok(JSON.stringify(p).length<=6144);return p;
}
