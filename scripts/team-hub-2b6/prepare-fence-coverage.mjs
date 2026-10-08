import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07';
const B=E+'/gate-b';fs.mkdirSync(B,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const save=(n,x)=>fs.writeFileSync(B+'/'+n+'.json',JSON.stringify(x,null,2)+'\n');
const iam=read(E+'/iam-coverage.json'),coverage=read(E+'/coverage-refresh.json'),edges=read(E+'/edge-refresh.json');
const priorPath='docs/architecture/team-hub-2b3-final-evidence-2026-10-05/coverage.json',prior=read(priorPath);
assert.equal(iam.principals.length,19);assert.equal(iam.missingPolicyDocuments,0);assert.equal(iam.paginationCompleted,true);
assert.equal(coverage.resolvers.length,30);assert.equal(edges.functions.length,131);assert.equal(edges.unknownPipelineEdges,0);
const functions=new Map(edges.functions.map(f=>[f.id,f]));
const principals=iam.principals.map(p=>{
  const actions=[...new Set(p.grants.flatMap(g=>g.actions))];
  const entryPaths=['dynamodb:','s3:','appsync:','lambda:'].filter(prefix=>actions.some(a=>a.startsWith(prefix)));
  return {arn:p.arn,kind:p.kind,trust:p.trust,boundary:p.boundary,administrationCapability:p.administrationCapability,
    grantStatementDigests:p.grants.map(g=>g.statementDigest),actions,entryPaths,
    priorClassification:prior.writers.find(w=>w.id==='PRINCIPAL:'+p.arn.split('/').at(-1))?.classification??'RETAINED_IN_REVIEW',
    currentGrantInterpretation:p.evaluation,
    proofRequired:actions.some(a=>/Put|Update|Delete|BatchWrite|PartiQLInsert|GraphQL|InvokeFunction/.test(a))?'ACTUAL_PATH_DENIAL_OR_REVIEWED_NO_BUSINESS_PATH_EVIDENCE':'REVALIDATE_NO_BUSINESS_WRITE_PATH',
    actualInstalledFenceProof:'PENDING',
    policyAdministrationRisk:p.administrationCapability?'Custody and change audit required; data deny is not immutable against policy administrators':'Retain provider/deployment path review; never grant extra access for testing'};
});
const resolvers=coverage.resolvers.map(r=>{
  const ids=r.pipeline?.functions??[];for(const id of ids)assert.ok(functions.has(id));
  return {...r,functionIds:ids,dataSources:[...new Set(ids.map(id=>functions.get(id).dataSource))],
    path:r.type==='Mutation'?(r.field==='mutateTeamHub'?'MANUAL_GATEWAY':'GENERATED_MODEL_WRITE'):'READ',
    requiredProof:r.type==='Mutation'?'AUTHENTICATED_AUTHORIZED_PATH_REACHES_INSTALLED_ENFORCEMENT':'READ_BEHAVIOR_PRESERVED_IN_FROZEN',liveProof:'PENDING'};
});
assert.equal(resolvers.filter(r=>r.path==='GENERATED_MODEL_WRITE').length,12);
const matrix={at:new Date().toISOString(),inputs:[E+'/iam-coverage.json',E+'/coverage-refresh.json',E+'/edge-refresh.json',priorPath].map(p=>({path:p,sha256:sha(p)})),
  principals,resolvers,functions:edges.functions.map(f=>({...f,businessResolverConsumers:resolvers.filter(r=>r.functionIds.includes(f.id)).map(r=>r.type+'.'+r.field)})),
  subscriptions:edges.subscriptions,streams:edges.streams,retainedWriters:prior.writers,
  rootPrincipal:iam.rootPrincipal,logoCleanupProvider:prior.writers.find(w=>w.id==='LOGO_CLEANUP_PROVIDER'),
  unknownPipelineEdges:0,scope:'Every inventoried principal/resolver/function retained. No principal removed because it is privileged, service-only or currently read-only. Snapshot is not a guarantee against future access grants.',
  liveProofComplete:false,awsWrites:0};save('writer-proof-matrix',matrix);
const P='docs/architecture/team-hub-2b5b-evidence-2026-10-07';
const files={C:['candidate.json','product-candidate.template.json','security-candidate.template.json','security-validation.json'],D:['monitoring-candidate.template.json'],E:[],F:['rehearsal.json','security-review.json']};
const preparation={at:new Date().toISOString(),authority:'LEGACY_WRITER',targetWrites:'DISABLED',epoch:null,frontendActivation:false,awsWrites:0,
  gates:Object.entries(files).map(([gate,names])=>({gate,status:'OFFLINE_PREPARATION_REVALIDATED_LIVE_ACCEPTANCE_PENDING',artifacts:names.map(n=>({path:P+'/'+n,sha256:sha(P+'/'+n)}))})),
  restrictions:['No artifact regeneration or deployment','No real control row initialized','Proposal epoch 3 is not a live accepted epoch','No gate fully accepted on simulated or historical evidence']};
preparation.gates.find(g=>g.gate==='C').remaining=['Exact security/product change-set review and separately authorized deployment','Actual Lambda role proof; no direct CONTROL writes from runtime','Initialize LEGACY_WRITER only if separately executing approved preparation; conditional absence check'];
preparation.gates.find(g=>g.gate==='D').remaining=['Monitoring template artifact/permissions review','Deployed signal injection and log/metric receipt','Accepted operator visibility; no notification delivery claimed'];
preparation.gates.find(g=>g.gate==='E').artifacts=['config/domains/team-hub/frontend-cutover.PROPOSAL.json','config/domains/core/domain-endpoints.Ntgre.json',E+'/frontend-revision.json',E+'/built-isolation.json'].map(p=>({path:p,sha256:sha(p)}));
preparation.gates.find(g=>g.gate==='E').remaining=['Bind only to actual strongly read deployed epoch and pinned bundle after authorization','Keep reviewed:false; no live frontend publication'];
preparation.gates.find(g=>g.gate==='F').remaining=['Refresh isolated export/restore/in-flight-failure proof against final deployed candidate before cutover','Fresh reconciliation and post-write recovery authorization; historical live rehearsal is not current Gate F acceptance'];
save('independent-gates-preparation',preparation);
console.log(JSON.stringify({principals:principals.length,resolvers:resolvers.length,functions:matrix.functions.length,generatedMutations:12,unknown:0,awsWrites:0}));
