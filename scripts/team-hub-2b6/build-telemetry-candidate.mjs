// Offline candidate build. Preserves previous artifacts and never publishes/deploys.
import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {build} from 'esbuild';import {singleFileZip} from '../team-hub-2b4/zip.mjs';
const P='docs/architecture/team-hub-2b5b-evidence-2026-10-07',E='docs/architecture/team-hub-2b6-evidence-2026-10-07/gate-d',B='.tmp/team-hub-2b6/gate-d';
fs.mkdirSync(B,{recursive:true});const read=p=>JSON.parse(fs.readFileSync(p));const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const save=(n,x)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(x,null,2)+'\n');
const previous=read(P+'/candidate.json'),revision=read(E+'/source-revision.json');
const allowed=['handler.mjs','observability.mjs','core-client.mjs','entry.mjs'].map(n=>'domains/team-hub/cutover/'+n);
assert.deepEqual(revision.changes.map(c=>c.path),allowed);
for(const row of previous.sourceHashes){const changed=revision.changes.find(c=>c.path===row.path);if(changed){assert.equal(changed.previousSha256,row.sha256);assert.equal(sha(E+'/previous-source/'+row.path.split('/').at(-1)),row.sha256);}else assert.equal(sha(row.path),row.sha256,row.path);}
assert.equal(sha(previous.runtimePath),previous.runtimeSha256);for(const k of ['product','security'])assert.equal(sha(P+'/'+k+'-candidate.template.json'),previous[k+'Sha256']);
revision.changes=revision.changes.map(c=>({...c,sha256:sha(c.path)}));revision.businessContractChanged=false;revision.runtimePermissionsChanged=false;save('source-revision',revision);
const result=await build({entryPoints:['domains/team-hub/cutover/entry.mjs'],outfile:B+'/index.js',bundle:true,platform:'node',format:'cjs',target:'node22',metafile:true,logLevel:'silent'});
const inputs=Object.keys(result.metafile.inputs);assert.ok(!inputs.some(p=>/parity\/(handler|core|fence|entry)\.mjs|team-hub\/core\.mjs|rehearsal/.test(p)));
fs.writeFileSync(B+'/runtime.zip',singleFileZip('index.js',fs.readFileSync(B+'/index.js')));const runtimeSha256=sha(B+'/runtime.zip');
const product=read(P+'/product-candidate.template.json'),security=read(P+'/security-candidate.template.json');
const key='team-hub/2b6-gate-d/'+runtimeSha256+'.zip';
for(const kind of ['Command','Read'])product.Resources['Parity'+kind+'Function'].Properties.Code.S3Key=key;
product.Resources.Stage.Properties.DefaultRouteSettings.DetailedMetricsEnabled=true;
assert.equal(product.Resources.Stage.Properties.AccessLogSettings,undefined);
assert.equal(product.Resources.CutoverAccessLogs,undefined);
save('product-candidate.template',product);const productSha256=sha(E+'/product-candidate.template.json');
const oldRuntime='team-hub/2b5b/'+previous.runtimeSha256+'.zip',oldTemplate='team-hub/2b5b/'+previous.productSha256+'.template.json',templateKey='team-hub/2b6-gate-d/'+productSha256+'.template.json';
const corrected=JSON.parse(JSON.stringify(security).replaceAll(oldRuntime,key).replaceAll(oldTemplate,templateKey));
save('security-candidate.template',corrected);
const policies={executionBoundary:corrected.Resources.ExecutionBoundary.Properties.PolicyDocument,executionIdentity:corrected.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument,caller:corrected.Resources.PreparationCaller.Properties.PolicyDocument,command:corrected.Resources.ParityCommandBoundary.Properties.PolicyDocument,read:corrected.Resources.ParityReadBoundary.Properties.PolicyDocument};
for(const [name,p]of Object.entries(policies)){save(name+'-candidate-policy',p);if(name!=='executionIdentity')assert.ok(JSON.stringify(p).length<=6144,name+' managed policy size');}
for(const kind of ['Command','Read']){assert.deepEqual(corrected.Resources['Parity'+kind+'Boundary'],security.Resources['Parity'+kind+'Boundary']);assert.deepEqual(product.Resources['Parity'+kind+'Role'],read(P+'/product-candidate.template.json').Resources['Parity'+kind+'Role']);}
const baseline=read(P+'/product-candidate.template.json');const changed=Object.keys(product.Resources).filter(k=>JSON.stringify(product.Resources[k])!==JSON.stringify(baseline.Resources[k]));assert.deepEqual(changed.sort(),['ParityCommandFunction','ParityReadFunction','Stage']);
const candidate={at:new Date().toISOString(),status:'PREPARED_NOT_DEPLOYED',approach:'A_MINIMAL_MONITORING',previousCandidate:{path:P+'/candidate.json',sha256:sha(P+'/candidate.json'),runtimeSha256:previous.runtimeSha256},runtimeSha256,runtimePath:B+'/runtime.zip',runtimeKey:key,productSha256,templateKey,securitySha256:sha(E+'/security-candidate.template.json'),sourceHashes:inputs.filter(p=>!p.includes('node_modules')).map(path=>({path,sha256:sha(path)})),resources:{product:Object.keys(product.Resources).length,security:Object.keys(corrected.Resources).length},changedFromPreviousProduct:changed,securityChange:'Exact candidate artifact references only; accepted dark rollback retained',runtimePermissionsChanged:false,apiAccessLogs:'DEFERRED_REQUIRES_EXPLICIT_REVIEW',detailedApiMetrics:true,authorityChanged:false,frontendActivated:false,awsWrites:0};save('candidate',candidate);console.log(JSON.stringify({runtimeSha256,productSha256,securitySha256:candidate.securitySha256,resources:candidate.resources,awsWrites:0}));
