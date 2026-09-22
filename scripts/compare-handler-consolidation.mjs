import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { accountAssembly, compareCounts } from './lib/cloudformation-accounting.mjs';

const [beforeDir,afterDir,outDir]=process.argv.slice(2);
if(!beforeDir||!afterDir||!outDir)throw new Error('Usage: node scripts/compare-handler-consolidation.mjs BASELINE_ASSEMBLY CANDIDATE_ASSEMBLY REPORT_DIRECTORY');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const stable=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);
const hash=b=>createHash('sha256').update(b).digest('hex');
function load(dir){const report=accountAssembly(dir);const templates=new Map(report.stacks.map(s=>[s.path,read(path.join(dir,s.file))]));const manifest=read(path.join(dir,'manifest.json'));const assets=new Map();for(const a of Object.values(manifest.artifacts||{}).filter(a=>a.type==='cdk:asset-manifest'))for(const f of Object.values(read(path.join(dir,a.properties.file)).files||{}))for(const d of Object.values(f.destinations||{}))assets.set(d.objectKey,path.join(dir,f.source.path));return {dir,report,templates,assets};}
const before=load(beforeDir),after=load(afterDir),changes=[],checks=[],failures=[];
const check=(name,condition,detail)=>{checks.push({name,passed:!!condition,detail});if(!condition)failures.push(name);};
function diff(a,b,p=''){if(stable(a)===stable(b))return [];if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)||Array.isArray(b))return [{property:p||'<resource>',before:a,after:b}];return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diff(a[k],b[k],p?p+'.'+k:k));}
const protectedTypes=new Set(['Custom::AmplifyDynamoDBTable','AWS::DynamoDB::Table','AWS::Cognito::UserPool','AWS::Cognito::UserPoolClient','AWS::Cognito::IdentityPool','AWS::Cognito::IdentityPoolRoleAttachment','AWS::Cognito::UserPoolGroup','AWS::S3::Bucket','AWS::KMS::Key','AWS::AppSync::GraphQLApi','AWS::AppSync::GraphQLSchema','AWS::Lambda::Function','AWS::ApiGatewayV2::Api','AWS::ApiGatewayV2::Route','AWS::ApiGatewayV2::Integration','AWS::ApiGatewayV2::Stage','AWS::Lambda::Permission']);
for(const stack of new Set([...before.templates.keys(),...after.templates.keys()])){
 const a=before.templates.get(stack),b=after.templates.get(stack);
 check('Template retained '+stack,!!a&&!!b);
 if(!a||!b)continue;
 check('Parameters/outputs unchanged '+stack,stable(a.Parameters)===stable(b.Parameters)&&stable(a.Outputs)===stable(b.Outputs));
 check('Template envelope unchanged '+stack,stable(Object.fromEntries(Object.entries(a).filter(([k])=>k!=='Resources')))===stable(Object.fromEntries(Object.entries(b).filter(([k])=>k!=='Resources'))));
 for(const id of new Set([...Object.keys(a.Resources||{}),...Object.keys(b.Resources||{})])){
  const old=a.Resources[id],next=b.Resources[id],type=(next||old).Type;
  if(stable(old)!==stable(next))changes.push({stack,logicalId:id,type,action:!old?'ADDED':!next?'DELETED':'UPDATED',properties:diff(old,next)});
  if(protectedTypes.has(type))check('Protected resource unchanged '+stack+'/'+id,stable(old)===stable(next),type);
 }
}
const fdPath=[...before.templates.keys()].find(k=>k.includes('FunctionDirectiveStack'));
if(!fdPath)throw new Error('FunctionDirectiveStack missing');
for(const change of changes){
 const paths=change.properties.map(p=>p.property);
 const allowed=change.action==='DELETED'
  ? change.stack===fdPath&&['AWS::IAM::Role','AWS::IAM::Policy','AWS::AppSync::DataSource','AWS::AppSync::FunctionConfiguration'].includes(change.type)
  : change.action==='UPDATED'&&(
    (change.stack===fdPath&&change.type==='AWS::AppSync::Resolver'&&paths.every(p=>p==='Properties.PipelineConfig.Functions'))||
    (change.type==='AWS::CloudFormation::Stack'&&paths.every(p=>p.startsWith('Properties.TemplateURL'))) ||
    (change.type==='AWS::AppSync::ApiKey'&&paths.every(p=>p==='Properties.Expires')) ||
    (change.logicalId==='amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsDeploymentCustomResource1536MiB21775929'&&paths.every(p=>p==='Properties.SourceObjectKeys')));
 check('Change within consolidation scope '+change.stack+'/'+change.logicalId,allowed);
}
const a=before.templates.get(fdPath),b=after.templates.get(fdPath);
function mapping(resource,key,context){if(resource.Properties[key]!==undefined)return resource.Properties[key];const location=resource.Properties[key+'S3Location'];const sub=location?.['Fn::Sub'];if(typeof sub!=='string')throw new Error('Unsupported mapping asset reference');const objectKey=sub.slice(sub.lastIndexOf('/')+1),file=context.assets.get(objectKey);if(!file)throw new Error('Missing mapping asset '+objectKey);return fs.readFileSync(file,'utf8');}
const normalizeVtl=s=>s.split(/\r?\n/).filter(s=>!s.trim().startsWith('##')).join('\n').trim();
const resolverChecks=[];
for(const [id,r]of Object.entries(a.Resources).filter(([,r])=>r.Type==='AWS::AppSync::Resolver')){
 const n=b.Resources[id];if(!n){check('Resolver retained '+id,false);continue;}
 const op=r.Properties.PipelineConfig.Functions.map(x=>x['Fn::GetAtt'][0]),np=n.Properties.PipelineConfig.Functions.map(x=>x['Fn::GetAtt'][0]);
 const old=structuredClone(r),next=structuredClone(n);delete old.Properties.PipelineConfig;delete next.Properties.PipelineConfig;
 const authSame=op[0]===np[0]&&stable(a.Resources[op[0]])===stable(b.Resources[np[0]]);
 check('Resolver non-pipeline properties unchanged '+id,stable(old)===stable(next));
 check('Authorization preserved '+id,op.length===2&&np.length===2&&authSame);
 const oldInvoke=a.Resources[op[1]],newInvoke=b.Resources[np[1]];
 for(const key of ['RequestMappingTemplate','ResponseMappingTemplate'])check(key+' equivalent '+id,normalizeVtl(mapping(oldInvoke,key,before))===normalizeVtl(mapping(newInvoke,key,after)));
 const oldDs=a.Resources[oldInvoke.Properties.DataSourceName['Fn::GetAtt'][0]],newDs=b.Resources[newInvoke.Properties.DataSourceName['Fn::GetAtt'][0]];
 check('Lambda target unchanged '+id,stable(oldDs.Properties.LambdaConfig)===stable(newDs.Properties.LambdaConfig));
 check('Field stash preserved '+id,stable(n.Properties.RequestMappingTemplate).includes(n.Properties.FieldName));
 resolverChecks.push({logicalId:id,field:r.Properties.TypeName+'.'+r.Properties.FieldName,auth:op[0],oldInvocation:op[1],newInvocation:np[1],authorizationUnchanged:authSame});
}
for(const [id,r]of Object.entries(b.Resources).filter(([,r])=>['AWS::IAM::Role','AWS::IAM::Policy'].includes(r.Type)))check('Retained directive IAM unchanged '+id,stable(a.Resources[id])===stable(r));
check('All 79 resolvers retained',resolverChecks.length===79);
check('Team Hub gateways retained',resolverChecks.some(r=>r.field==='Query.readTeamHub')&&resolverChecks.some(r=>r.field==='Mutation.mutateTeamHub'));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
function fileHashes(p){return fs.statSync(p).isDirectory()?walk(p).map(f=>({path:path.relative(p,f).replaceAll('\\','/'),sha256:hash(fs.readFileSync(f))})).sort((a,b)=>a.path.localeCompare(b.path)):[{path:path.basename(p),sha256:hash(fs.readFileSync(p))}];}
const lambdaAssets=[];
for(const [stack,t]of before.templates)for(const [id,r]of Object.entries(t.Resources).filter(([,r])=>r.Type==='AWS::Lambda::Function')){
 const n=after.templates.get(stack).Resources[id],code=r.Properties.Code,newCode=n?.Properties.Code;
 const key=code.S3Key,newKey=newCode?.S3Key;
 if(typeof key==='string'&&typeof newKey==='string'&&before.assets.has(key)&&after.assets.has(newKey)){
  const old=fileHashes(before.assets.get(key)),next=fileHashes(after.assets.get(newKey));check('Lambda asset bytes unchanged '+id,stable(old)===stable(next));lambdaAssets.push({stack,logicalId:id,beforeKey:key,afterKey:newKey,files:old,unchanged:stable(old)===stable(next)});
 }else {check('Lambda asset verifiable '+id,stable(code)===stable(newCode)&&!!code.ZipFile);lambdaAssets.push({stack,logicalId:id,inline:!!code.ZipFile,unchanged:stable(code)===stable(newCode)});}
}
const summary={before:before.report,after:after.report,delta:compareCounts(before.report,after.report),actions:Object.fromEntries(['ADDED','UPDATED','DELETED'].map(k=>[k,changes.filter(c=>c.action===k).length])),checks:checks.length,failed:failures,lambdaResources:lambdaAssets.length,note:'Exact local template/asset comparison, not an AWS change set or live update-order proof. No deployments performed.'};
fs.mkdirSync(outDir,{recursive:true});
for(const [name,value]of Object.entries({summary,changes,checks,resolvers:resolverChecks,'lambda-assets':lambdaAssets}))fs.writeFileSync(path.join(outDir,name+'.json'),JSON.stringify(value,null,2)+'\n');
console.log(JSON.stringify({before:before.report.total,after:after.report.total,actions:summary.actions,checks:checks.length,failures},null,2));
if(failures.length)process.exitCode=1;
