// Read-only/local architecture inventory. --verify-live adds only STS/CloudFormation reads.
// No synthesis, deployment, AWS invocation, application edit or secret output.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const out = 'docs/architecture';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const hash = v => crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const stable = v => Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const save = (name,v) => fs.writeFileSync(`${out}/${name}`,JSON.stringify(v,null,2)+'\n');
const gate = read('.amplify/phase1-execution-20260926/gate.json');
const stacks = gate.stacks.map(s=>({...s,...read(`.amplify/phase1-execution-20260926/after-${s.key}.json`)}));
const byPath=new Map(stacks.map(s=>[s.path,s]));
const source=fs.readFileSync('amplify/data/resource.ts','utf8');
const declarations=[...source.matchAll(/\b(\w+):\s*a\s*\.\s*(model|query|mutation)\s*\(/g)].map(m=>({name:m[1],kind:m[2],line:source.slice(0,m.index).split('\n').length}));
const modelNames=declarations.filter(d=>d.kind==='model').map(d=>d.name);
const groups={
  'TEAM HUB':['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry'],
  'CREATOR PLATFORM':['CreatorWorkspaceRecord','WorkspaceMembership','WorkspaceMembershipPermission','WorkspaceMembershipPermissionSet','TwitchCommand','TwitchIntegration','TwitchTokenVault','TwitchOAuthTransaction','TwitchRuntimeHealth','RewardRedemptionEvent','RewardRedemptionEventClaim','AlphaServiceNonce','DiscordBotConfiguration'],
  'COMMERCE':['MerchCategory','MerchProduct','MerchProductVariant','FulfillmentOrder','MerchProductBrand','MerchProductCategory','MerchProductImage'],
  'COMMUNITY / EVENTS':['EventTag','Event','EventSuggestion','ForumCategory','ForumBoard','ForumThread','ForumPost','ForumActivity','BoardPermissionRule'],
  'ADMIN / OPERATIONS':['InvestorAccessRequest','InvestorAccess','InvestorAccessAuditEvent','ApplicationSubmission','ApplicationAnswer','ApplicationCreatorProfile','ApplicationSchedule','ApplicationAuditEvent','ApplicationIdempotency','ApplicationPublicRateLimit'],
  'CORE / SHARED':['UserProfile','PermissionDefinition','GroupPermission','PermissionAuditEvent','Brand','BrandAccess','BrandAccessPermission','MediaCollection','MediaItem'],
};
const modelDomain=n=>Object.entries(groups).find(([,a])=>a.includes(n))?.[0]||'UNRESOLVED';
const opDomain=n=> /TeamHub/.test(n)?'TEAM HUB':/Twitch|Discord|Workspace/.test(n)?'CREATOR PLATFORM':/Merch|Order/.test(n)?'COMMERCE':/Event|Forum|Recurring/.test(n)?'COMMUNITY / EVENTS':/Investor|Application|AdminUsers|UserRoles/.test(n)?'ADMIN / OPERATIONS':/Permission|AccessContext|Brand|Media|Profiles/.test(n)?'CORE / SHARED':'UNRESOLVED';
const moduleFor=d=>({'TEAM HUB':'amplify/myFunction/teamHub','CREATOR PLATFORM':'amplify/myFunction/{twitch,discord,workspaces}; amplify/overlaySource; amplify/functions/twitch-runtime','COMMERCE':'amplify/myFunction/{merch,fulfillment,printful,revolut,stage9}','COMMUNITY / EVENTS':'amplify/myFunction/{events,forums}','ADMIN / OPERATIONS':'amplify/myFunction/{applications,investors}; amplify/functions/admin-user-management','CORE / SHARED':'amplify/{backend.ts,auth,storage}; amplify/myFunction/{shared,permissions,brands,media}','UNRESOLVED':'Requires ownership review'})[d];
const parent=s=>byPath.get(s.path.slice(0,s.path.lastIndexOf('/')));
const modelForStack=s=>modelNames.find(n=>s.path.endsWith(`amplifyData${n}NestedStack${n}NestedStackResource${s.path.slice(-8)}`));
const all=[];
for(const s of stacks){
  s.model=modelForStack(s);s.domain=s.model?modelDomain(s.model):s.path.includes('overlaysource')?'CREATOR PLATFORM':'CORE / SHARED';
  s.resourceMap=new Map(s.resources.map(r=>[r.LogicalResourceId,r]));
  for(const [logicalId,r] of Object.entries(s.template.Resources||{})){
    const cdkPath=r.Metadata?.['aws:cdk:path']||'';
    let domain=s.domain,reason=s.model?`Generated resources for model ${s.model}`:'Shared deployment/API/provider infrastructure';
    let operation=null;
    if(s.path.includes('FunctionDirectiveStack')&&(r.Type==='AWS::AppSync::Resolver'||(r.Type==='AWS::AppSync::FunctionConfiguration'&&!logicalId.startsWith('Invoke')))){
      operation=declarations.filter(d=>d.kind!=='model').find(d=>r.Properties?.FieldName===d.name||logicalId.toLowerCase().includes(d.name.toLowerCase()))?.name;
      if(operation){domain=opDomain(operation);reason=`Custom operation ${operation} resolver/auth stage`;}
    }
    if(!s.model&&/twitchruntime|TwitchToken|Overlay/i.test(cdkPath+' '+logicalId)){domain='CREATOR PLATFORM';reason='Explicit creator runtime/token/overlay construct';}
    if(!s.model&&/admin-?user-?management/i.test(cdkPath)){domain='ADMIN / OPERATIONS';reason='Dedicated account-administration function resources';}
    if(r.Type==='AWS::CloudFormation::Stack'){
      const child=byPath.get(s.path+'/'+logicalId),model=child&&modelForStack(child);
      if(model){domain=modelDomain(model);reason=`Nested handle for ${model}`;}
    }
    if(r.Type.startsWith('AWS::ApiGateway')&&s.path.includes('apistack')){
      const route=r.Properties?.RouteKey||cdkPath;
      if(/twitch|alpha\/reward/i.test(route)){domain='CREATOR PLATFORM';reason='Creator REST route/permission';}
      else if(/printful|revolut|orders/i.test(route)){domain='COMMERCE';reason='Commerce REST route/permission';}
    }
    const entry={id:s.key+':'+logicalId,stackKey:s.key,logicalId,physicalId:s.resourceMap.get(logicalId)?.PhysicalResourceId||null,type:r.Type,cdkPath,domain,attribution:reason,source:s.model?`amplify/data/resource.ts#${s.model}`:moduleFor(domain),model:s.model||null,operation,stateful:/DynamoDB|Cognito::UserPool$|S3::Bucket$|KMS::Key$/.test(r.Type),deletionPolicy:r.DeletionPolicy||null,updateReplacePolicy:r.UpdateReplacePolicy||null};
    if(r.Type==='AWS::AppSync::ApiKey'){entry.physicalIdSha256=hash(entry.physicalId);entry.physicalId='REDACTED: API-key-bearing physical identifier';}
    if(r.Type==='AWS::Lambda::Function')entry.configuration={runtime:r.Properties.Runtime,handler:r.Properties.Handler,environmentKeys:Object.keys(r.Properties.Environment?.Variables||{})};
    if(r.Type==='AWS::AppSync::Resolver')entry.graphql={type:r.Properties.TypeName,field:r.Properties.FieldName,kind:r.Properties.Kind||'UNIT'};
    all.push(entry);
  }
}
const resourceById=new Map(all.map(r=>[r.id,r]));
const edges=[];
function intrinsicRefs(v){
  const found=[];
  function walk(x,p=''){
    if(!x||typeof x!=='object')return;
    if(x.Ref)found.push({ref:x.Ref,property:p});
    if(x['Fn::GetAtt']){const a=x['Fn::GetAtt'];const [ref,...attr]=Array.isArray(a)?a:String(a).split('.');found.push({ref,attribute:attr.join('.'),property:p});}
    if(x['Fn::Sub']){const sub=x['Fn::Sub'],str=Array.isArray(sub)?sub[0]:sub,vars=Array.isArray(sub)?sub[1]:{};for(const m of String(str).matchAll(/\$\{([^!][^}]*)\}/g)){if(Object.hasOwn(vars||{},m[1]))continue;const [ref,...attr]=m[1].split('.');found.push({ref,attribute:attr.join('.'),property:p+'/Fn::Sub'});}}
    if(x['Fn::ImportValue'])found.push({import:typeof x['Fn::ImportValue']==='string'?x['Fn::ImportValue']:'expression:'+hash(x['Fn::ImportValue']),property:p});
    for(const [k,y]of Object.entries(x))if(!['Ref','Fn::GetAtt'].includes(k))walk(y,p+'/'+k);
  }walk(v);return found;
}
function resolve(s,ref,attribute,seen=new Set()){
  const marker=s.key+':'+ref+':'+attribute;if(seen.has(marker))return [{target:'cycle:'+marker,unknown:true}];seen=new Set([...seen,marker]);
  if(ref.startsWith('AWS::'))return [{target:ref,platform:true}];
  const r=s.template.Resources?.[ref];
  if(r){
    const child=byPath.get(s.path+'/'+ref);
    if(child&&attribute?.startsWith('Outputs.')){const value=child.template.Outputs?.[attribute.slice(8)]?.Value;if(value!==undefined)return resolveValue(child,value,seen);}
    return [{target:s.key+':'+ref}];
  }
  if(s.template.Parameters?.[ref]){
    const p=parent(s),handle=s.path.split('/').at(-1),value=p?.template.Resources?.[handle]?.Properties?.Parameters?.[ref];
    if(value!==undefined)return resolveValue(p,value,seen);
    const known=Object.hasOwn(s.template.Parameters[ref],'Default')||ref==='BootstrapVersion';
    return [{target:'parameter:'+s.key+':'+ref,unknown:!known,platform:known}];
  }
  return [{target:'unresolved:'+s.key+':'+ref,unknown:true}];
}
function resolveValue(s,v,seen){const refs=intrinsicRefs(v);return refs.flatMap(r=>r.import?[{target:'export:'+r.import,unknown:true}]:resolve(s,r.ref,r.attribute,seen));}
for(const s of stacks){
  for(const [id,r]of Object.entries(s.template.Resources||{})){
    for(const ref of intrinsicRefs(r.Properties||{})){
      const targets=ref.import?[{target:'export:'+ref.import,unknown:true}]:resolve(s,ref.ref,ref.attribute);
      for(const t of targets){const from=resourceById.get(s.key+':'+id),to=resourceById.get(t.target);edges.push({from:from.id,to:t.target,property:ref.property,via:ref.import?'Fn::ImportValue':ref.attribute?'GetAtt/Sub':'Ref/Sub',domainFrom:from.domain,domainTo:to?.domain||null,crossStack:!!to&&to.stackKey!==from.stackKey,classification:t.unknown?'UNKNOWN':t.platform||to?.domain==='CORE / SHARED'?'SHARED PLATFORM DEPENDENCY':'HARD DEPENDENCY'});}
    }
    for(const target of [r.DependsOn||[]].flat())edges.push({from:s.key+':'+id,to:s.key+':'+target,property:'DependsOn',via:'CDK/CloudFormation DependsOn',classification:'HARD DEPENDENCY',crossStack:false});
  }
}
const tally=(items,key)=>items.reduce((o,r)=>(o[r[key]]=(o[r[key]]||0)+1,o),{});
const stackRows=stacks.map(s=>{const resources=all.filter(r=>r.stackKey===s.key),outgoing=edges.filter(e=>resourceById.get(e.from)?.stackKey===s.key);return {key:s.key,name:s.stack.StackName||s.stackId.split('/')[1],arn:s.stackId,parent:parent(s)?.key||null,path:s.path,count:resources.length,resourceTypes:tally(resources,'type'),domains:tally(resources,'domain'),model:s.model||null,source:s.model?`amplify/data/resource.ts#${s.model}`:moduleFor(s.domain),lambdaFunctions:resources.filter(r=>r.type==='AWS::Lambda::Function').map(r=>r.id),tables:resources.filter(r=>/DynamoDB/.test(r.type)).map(r=>r.id),appSync:resources.filter(r=>r.type.startsWith('AWS::AppSync::')).length,dependencies:{cognito:outgoing.filter(e=>resourceById.get(e.to)?.type.includes('Cognito')).map(e=>e.to),s3:outgoing.filter(e=>resourceById.get(e.to)?.type.includes('S3::')).map(e=>e.to),iam:resources.filter(r=>r.type.includes('IAM::')).map(r=>r.id),api:outgoing.filter(e=>/AppSync|ApiGateway/.test(resourceById.get(e.to)?.type||'')).map(e=>e.to),crossStackEdges:outgoing.filter(e=>e.crossStack).length},parameters:Object.keys(s.template.Parameters||{}),outputs:Object.keys(s.template.Outputs||{}),exports:Object.entries(s.template.Outputs||{}).filter(([,v])=>v.Export).map(([key,v])=>({key,name:v.Export.Name})),imports:intrinsicRefs(s.template).filter(r=>r.import).map(r=>r.import),templateSha256:hash(stable(s.template))};});
const domains=Object.fromEntries([...Object.keys(groups),'TOURNAMENTS','WEBSITE / CONTENT','NOTIFICATIONS / COMMUNICATIONS','UNRESOLVED'].map(d=>{const r=all.filter(r=>r.domain===d),functions=r.filter(r=>r.type==='AWS::Lambda::Function').length,tables=r.filter(r=>/DynamoDB/.test(r.type)).length,api=r.filter(r=>/AppSync|ApiGateway/.test(r.type)).length;return [d,{resources:r.length,functions,tables,apiResources:api,other:r.length-functions-tables-api,models:modelNames.filter(n=>modelDomain(n)===d),customOperations:declarations.filter(o=>o.kind!=='model'&&opDomain(o.name)===d).map(o=>o.name)}];}));
const operations=declarations.filter(d=>d.kind!=='model').map(d=>({...d,domain:opDomain(d.name),resources:all.filter(r=>r.operation===d.name).map(r=>r.id)}));
const sourceFiles=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(?:ts|js|mjs|vue)$/.test(p)&&!/(?:test|spec)\./.test(p))sourceFiles.push(p.replaceAll('\\','/'));}}
walk('amplify');walk('src');walk('infrastructure');
const sourceDependencies=sourceFiles.map(file=>{const text=fs.readFileSync(file,'utf8');return {file,imports:[...text.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)].map(m=>m[1]),modelUses:[...new Set([...text.matchAll(/\.models\.(\w+)|\b(?:tables|teamHubTables)\.(\w+)/g)].map(m=>m[1]||m[2]))],schemaTypeDependency:/import\s+type[\s\S]{0,120}data\/resource/.test(text)};}).filter(r=>r.imports.length||r.modelUses.length);
const domainEdges=[
 ['All authenticated domains','Core identity','SHARED PLATFORM DEPENDENCY','One environment-specific Cognito issuer/client; preserve sub and groups','amplify/auth/resource.ts'],
 ['Team Hub','Legacy AppSync/generated client','REMOVABLE COUPLING','Model calls and full Schema import; replace with domain-owned data adapter only after parity tests','amplify/myFunction/{teamHub/index.ts,shared/dataClient.ts}'],
 ['Team Hub','Team/Membership/Roster/Champion tables','HARD DEPENDENCY','Reads, writes, indexes and membership/roster transactions; custom provider still owns tables','amplify/myFunction/teamHub/{index,dynamo}.ts'],
 ['Team Hub','Core permissions','SHARED PLATFORM DEPENDENCY','Branding capability reads PermissionDefinition/GroupPermission, not just JWT groups','amplify/myFunction/shared/requirePermission.ts'],
 ['Team Hub','Core identity directory','SHARED PLATFORM DEPENDENCY','Exact-account resolution uses Cognito ListUsers; do not grant unrestricted administration','amplify/myFunction/teamHub/accounts.ts'],
 ['Team Hub','Core media bucket','SHARED PLATFORM DEPENDENCY','team-logos prefix uploads/deletion/verification','amplify/myFunction/teamHub/branding.ts'],
 ['Team Hub/Commerce/Creator/Community/Operations','Shared myFunction artifact','ACCIDENTAL COUPLING','One handler router, deployment artifact, IAM role and generated Schema tie unrelated changes together','amplify/myFunction/router/{appSyncRouter,restRouter}.ts'],
 ['All legacy models/custom operations','One defineData schema/codegen','ACCIDENTAL COUPLING','Full-schema synthesis, authorization generation, relationship stack and outputs','amplify/data/resource.ts'],
 ['All legacy domains','Amplify root pipeline','ACCIDENTAL COUPLING','createStack uses NestedStack; hosted build invokes whole pipeline-deploy','amplify/backend.ts; amplify.yml'],
 ['Creator runtime','Creator integration/control','HARD DEPENDENCY','Signed HTTP lease/manifest and generated IAM AppSync calls','amplify/functions/twitch-runtime; infrastructure/twitch-runtime'],
 ['Creator overlay','Core Brand + CreatorWorkspaceRecord','REMOVABLE COUPLING','Direct cross-domain table reads and grants; replace with owner contracts/projection where latency permits','amplify/overlaySource/composition.ts'],
 ['Creator runtime','Overlay tables/WebSocket/KMS','HARD DEPENDENCY','Publishing/dedupe/connection state and resource grants mutate runtime config through composition','amplify/overlaySource/infrastructure.ts'],
 ['Creator OAuth and token vault','Existing KMS key and external Twitch','HARD DEPENDENCY','Encryption key, OAuth callback, credentials and provider app contract must stay compatible','amplify/backend.ts; amplify/myFunction/twitch'],
 ['Commerce','Revolut / Printful','HARD DEPENDENCY','Checkout, signed webhook, fulfillment, reconciliation and idempotency','amplify/myFunction/{revolut,printful,fulfillment,stage9}'],
 ['Commerce','Brand / media / profile Core','SHARED PLATFORM DEPENDENCY','Generated relations and operational reads; preserve product identifiers and media references','amplify/data/resource.ts'],
 ['Community events/forums','Core identity/permissions/profile','SHARED PLATFORM DEPENDENCY','Authorization and attributed authorship; not Tournament competition state','amplify/myFunction/{events,forums}'],
 ['Intake / investor access','Core identity/media/admin function','HARD DEPENDENCY','Private documents, approvals and elevated directory actions','amplify/myFunction/{applications,investors}; amplify/functions/admin-user-management'],
 ['Admin UI','Each owning product API','SOFT DEPENDENCY','Compose domain administration in UI; no new all-powerful Admin infrastructure root','src/views/Admin; src/features/Team Hub'],
 ['Frontend','Generated legacy outputs','HARD DEPENDENCY','Auth/API/storage/model metadata drive Amplify configuration and generated operations','src/main.js; amplify_outputs.json; scripts/validate-amplify-contract.mjs'],
 ['Frontend REST consumers','Global REST base environment override','REMOVABLE COUPLING','Replace one global URL with validated domain endpoint manifests incrementally','src/config/apiBaseUrl.js'],
 ['Tournaments (future)','Team Hub membership validation','HARD DEPENDENCY','Proposed owner API for registration eligibility; no direct team-table writes','src/features/tournaments/tournament.data.js; proposed contract'],
 ['Tournaments (future)','Creator public broadcast metadata','SOFT DEPENDENCY','Optional stream links/approved public projections; no OAuth vault access','src/features/tournaments/tournament.data.js; proposed contract'],
 ['Tournaments now','Frontend fixture adapter','REMOVABLE COUPLING','No dedicated deployed models or operations; preview fixtures are not live registrations','src/features/tournaments/tournament.data.js'],
 ['Domain Lambdas','Shared source libraries','SOFT DEPENDENCY','Versioned pure auth/contract libraries compile into each artifact; do not import backend constructs','amplify/myFunction/shared'],
 ['External runtime monitor','EventBridge schedule/ECS events/heartbeat table','HARD DEPENDENCY','Standalone runtime source contains scheduled health and task-stopped consumers; not in Ntgre 2621 count','infrastructure/twitch-runtime'],
 ['Historical RavensBot / Companion / Founder or Stripe integrations','Unestablished ownership/consumers','UNKNOWN','Original audit does not establish safe ownership/migration; no dedicated current Ntgre schema models prove these proposed examples','audit-readonly-2026-09-10; source inventory'],
].map(([from,to,classification,reason,evidence])=>({from,to,classification,reason,evidence}));
let verification={mode:'Prior post-deployment snapshot; use --verify-live for fresh equivalence',priorCapture:'2026-09-26',fresh:false};
const priorPath=`${out}/phase2-resource-domain-map.json`;
if(fs.existsSync(priorPath)){const prior=read(priorPath);if(prior.verification?.fresh&&stackRows.every(s=>prior.stacks.some(p=>p.key===s.key&&p.templateSha256===s.templateSha256)))verification=prior.verification;}
if(process.argv.includes('--verify-live')){
  async function aws(args){const allowed={sts:['get-caller-identity'],cloudformation:['describe-stacks','get-template','list-stack-resources','list-imports']};if(!allowed[args[0]]?.includes(args[1]))throw Error('Read-only allowlist rejected command');for(let attempt=0;;attempt++){try{const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json'],{maxBuffer:20*1024*1024,windowsHide:true});return JSON.parse(stdout);}catch(error){if(attempt>=4||!/Throttling|Rate exceeded/.test(error.stderr||''))throw error;await new Promise(resolve=>setTimeout(resolve,1000*2**attempt));}}}
  const identity=await aws(['sts','get-caller-identity']);if(identity.Account!=='058264289478')throw Error('Wrong account');
  const root=(await aws(['cloudformation','describe-stacks','--stack-name',gate.stack.StackId])).Stacks[0];if(root.StackStatus!=='UPDATE_COMPLETE')throw Error('Unstable root');
  let cursor=0;const checks=[];
  await Promise.all(Array.from({length:4},async()=>{while(cursor<stacks.length){const s=stacks[cursor++];const [template,resources]=await Promise.all([aws(['cloudformation','get-template','--stack-name',s.stackId]),aws(['cloudformation','list-stack-resources','--stack-name',s.stackId])]);const t=typeof template.TemplateBody==='string'?JSON.parse(template.TemplateBody):template.TemplateBody;const ids=rs=>stable(Object.fromEntries(rs.filter(r=>r.ResourceStatus!=='DELETE_COMPLETE').map(r=>[r.LogicalResourceId,{physical:r.PhysicalResourceId,type:r.ResourceType}])));const templateMatch=hash(stable(t))===hash(stable(s.template)),identitiesMatch=JSON.stringify(ids(resources.StackResourceSummaries))===JSON.stringify(ids(s.resources));if(!templateMatch||!identitiesMatch)throw Error('Snapshot drift '+s.path);checks.push({key:s.key,templateMatch,identitiesMatch});}}));
  const exports=stacks.flatMap(s=>(s.stack.Outputs||[]).filter(o=>o.ExportName).map(o=>({stackKey:s.key,name:o.ExportName})));let exportCursor=0;
  await Promise.all(Array.from({length:1},async()=>{while(exportCursor<exports.length){const e=exports[exportCursor++];try{e.consumers=(await aws(['cloudformation','list-imports','--export-name',e.name])).Imports||[];}catch(error){if(String(error.stderr).includes('is not imported by any stack')){e.consumers=[];e.response='AWS explicit no-importers ValidationError';}else throw error;}await new Promise(resolve=>setTimeout(resolve,400));}}));
  verification={mode:'Fresh read-only AWS template and physical-identity comparison',fresh:true,at:new Date().toISOString(),identity,region:'eu-north-1',rootStatus:root.StackStatus,lastUpdated:root.LastUpdatedTime,checks:checks.sort((a,b)=>a.key.localeCompare(b.key)),exportConsumers:exports,productionModified:false,awsWrites:false};
}
if(all.length!==2621||stackRows.length!==62||modelNames.length!==52||operations.length!==79)throw Error('Unexpected baseline totals');
if(Object.values(domains).reduce((n,d)=>n+d.resources,0)!==2621)throw Error('Domain accounting mismatch');
save('phase2-resource-domain-map.json',{version:1,scope:'Ntgre only; independent external runtimes are outside this recursive count',verification,method:'Every CloudFormation declaration counted once including nested handles and metadata. Model stack resources/handles assigned to their model; custom resolver/auth stages assigned by operation; shared providers, handlers and multi-domain APIs retained as CORE / SHARED. Counts are ownership attribution, not transplantable deployments.',total:all.length,stackCount:stackRows.length,resourceTypes:tally(all,'type'),domains,operations,stacks:stackRows,resources:all});
save('phase2-dependency-map.json',{version:1,direction:'consumer depends on target; parameter and nested-output references resolved to declaring resource where possible',limitations:['IAM edges express permission, not observed calls','Literal/wildcard external service targets and dynamic runtime dispatch need the report/source review','Shared Lambda resources are not split fractionally across domains','Model links are inferred from construct ownership, not data scans'],summary:{edges:edges.length,crossStack:edges.filter(e=>e.crossStack).length,unresolved:edges.filter(e=>e.classification==='UNKNOWN').length,exports:stackRows.reduce((n,s)=>n+s.exports.length,0),imports:stackRows.reduce((n,s)=>n+s.imports.length,0)},domainEdges,edges,sourceDependencies});
const rows=stackRows.map(s=>`| ${s.key} | ${s.name} | ${s.parent||'—'} | ${s.count} | ${s.model||Object.keys(s.domains).join(', ')} |`);
fs.writeFileSync(`${out}/phase2-stack-inventory.md`,'# Phase 2 Ntgre stack inventory\n\nGenerated by `phase2-analyze.mjs`; full types, dependencies, sources and resource IDs are in `phase2-resource-domain-map.json`. Parent values refer to stack keys. Counts include nested handles. Physical ownership is unchanged.\n\n| Key | Stack name | Parent | Resources | Model / attribution |\n| --- | --- | --- | ---: | --- |\n'+rows.join('\n')+'\n');
console.log(JSON.stringify({total:all.length,stacks:stacks.length,domains,largest:stackRows.sort((a,b)=>b.count-a.count).slice(0,5).map(s=>({key:s.key,count:s.count,name:s.name})),dependencySummary:read(`${out}/phase2-dependency-map.json`).summary,verification:{fresh:verification.fresh,at:verification.at}},null,2));
