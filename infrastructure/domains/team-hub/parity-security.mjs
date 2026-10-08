export const root='ProjectRespawn-TeamHub-Ntgre';
export const operational=`arn:aws:dynamodb:eu-north-1:058264289478:table/${root}-Operational`,journal=`arn:aws:dynamodb:eu-north-1:058264289478:table/${root}-Journal`;
const list=x=>Array.isArray(x)?x:[x];
export function runtimePolicy(preview,kind){
 const p=JSON.parse(JSON.stringify(preview).replaceAll('/team-hub/preview','/team-hub/parity-'+kind.toLowerCase()));
 const reads=['dynamodb:GetItem','dynamodb:Query'],writes=['dynamodb:PutItem','dynamodb:DeleteItem','dynamodb:ConditionCheckItem'];
 p.Statement[0].Sid='OnlyOwnedParityOperations';p.Statement[0].NotAction.push(...reads,...(kind==='Command'?writes:[]));
 const keys={'ForAllValues:StringLike':{'dynamodb:LeadingKeys':['TEAM#team:phase2b4-test-*','SLUG#phase2b4-test-*']}};
 p.Statement.push({Effect:'Allow',Action:reads,Resource:operational,Condition:keys});
 if(kind==='Command')p.Statement.push(
  {Effect:'Allow',Action:'dynamodb:GetItem',Resource:journal,Condition:{'ForAllValues:StringLike':{'dynamodb:LeadingKeys':['IDEMP#*#team:phase2b4-test-*']}}},
  {Effect:'Allow',Action:['dynamodb:PutItem','dynamodb:DeleteItem'],Resource:operational,Condition:{...keys,'ForAnyValue:StringEquals':{'dynamodb:EnclosingOperation':['TransactWriteItems']}}},
  // ConditionCheckItem exists only within transactions and does not support
  // EnclosingOperation in the service authorization reference.
  {Effect:'Allow',Action:'dynamodb:ConditionCheckItem',Resource:operational,Condition:keys},
  {Effect:'Allow',Action:'dynamodb:PutItem',Resource:journal,Condition:{'ForAllValues:StringLike':{'dynamodb:LeadingKeys':['TEAM#team:phase2b4-test-*','IDEMP#*#team:phase2b4-test-*']},'ForAnyValue:StringEquals':{'dynamodb:EnclosingOperation':['TransactWriteItems']}}});
 p.Statement.push({Effect:'Deny',Action:'dynamodb:*',NotResource:kind==='Command'?[operational,journal]:operational});
 return p;
}
export function extendExecution(original,assetArn){
 const p=structuredClone(original),roles=['PreviewRead','ParityCommand','ParityRead'].map(s=>`arn:aws:iam::058264289478:role/${root}-${s}`);
 for(const s of p.Statement){
  if(s.Resource===`arn:aws:lambda:eu-north-1:058264289478:function:${root}-PreviewRead`)s.Resource=['PreviewRead','ParityCommand','ParityRead'].map(n=>`arn:aws:lambda:eu-north-1:058264289478:function:${root}-${n}`);
  if(s.Effect==='Allow'&&list(s.Action).includes('logs:CreateLogGroup'))s.Resource.push(...['command','read'].flatMap(n=>[`arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/team-hub/parity-${n}`,`arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/team-hub/parity-${n}:*`]));
  if(s.Effect==='Allow'&&list(s.Action).includes('cloudwatch:PutMetricAlarm'))s.Resource=[s.Resource,...['Command','Read'].flatMap(n=>['Errors','Throttles'].map(m=>`arn:aws:cloudwatch:eu-north-1:058264289478:alarm:${root}-Parity${n}-${m}`))];
  if(s.Resource===roles[0]&&s.Action!=='iam:CreateRole')s.Resource=roles;
  if(s.NotResource===roles[0])s.NotResource=roles;
  if(s.Effect==='Allow'&&list(s.Action).includes('s3:GetObject'))s.Resource=[...list(s.Resource),assetArn];
  if(s.Action==='s3:*'&&s.NotResource)s.NotResource=[...list(s.NotResource),assetArn];
 }
 for(const kind of ['Command','Read'])p.Statement.push({Effect:'Allow',Action:'iam:CreateRole',Resource:`arn:aws:iam::058264289478:role/${root}-Parity${kind}`,Condition:{ArnEquals:{'iam:PermissionsBoundary':`arn:aws:iam::058264289478:policy/${root}-Parity${kind}Boundary`}}});
 // Boundary consolidates unconditional service grants. Identity retains the per-service clauses.
 // Resource types keep services disjoint; CreateRole/PassRole conditions remain separate.
 const b={Version:'2012-10-17',Statement:[]},actions=new Set(),resources=new Set();
 for(const s of p.Statement){if(s.Effect==='Allow'&&!s.Condition){list(s.Action).forEach(a=>actions.add(a));list(s.Resource).forEach(r=>resources.add(r));}else b.Statement.push(structuredClone(s));}
 // DescribeLogGroups is service-wide and must never turn the grouped resource list into '*'.
 actions.delete('logs:DescribeLogGroups');resources.delete('*');b.Statement.push({Effect:'Allow',Action:[...actions],Resource:[...resources]},{Effect:'Allow',Action:'logs:DescribeLogGroups',Resource:'*'});
 // Managed boundary's 6,144-character ceiling: stateless namespaces are bounded
 // to this domain; the inline identity still names the exact three functions,
 // log groups and alarms. Effective permission is their intersection.
 const grouped=b.Statement.at(-2);
 const stateless=['arn:aws:lambda:','arn:aws:logs:','arn:aws:cloudwatch:'];
 grouped.Resource=grouped.Resource.filter(r=>!stateless.some(prefix=>r.startsWith(prefix)));
 grouped.Resource.push(`arn:aws:lambda:eu-north-1:058264289478:function:${root}-*`,'arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/team-hub/*',`arn:aws:cloudwatch:eu-north-1:058264289478:alarm:${root}-*`);
 // These explicit denies remain unchanged in the identity. The boundary has
 // no matching Allow outside its exact assets/tables or for boundary mutation.
 b.Statement=b.Statement.filter(s=>!(s.Effect==='Deny'&&(s.Action==='s3:*'||s.Action==='dynamodb:*'||list(s.Action).includes('iam:CreatePolicyVersion'))));
 for(const statement of b.Statement)delete statement.Sid;
 return {identity:p,boundary:b};
}
