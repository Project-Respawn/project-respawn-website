import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
const root=process.cwd(),E='docs/architecture/team-hub-post-abort-correction-evidence-2026-10-13',B='.tmp/team-hub-post-abort-correction';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
fs.mkdirSync(E,{recursive:true});fs.mkdirSync(B,{recursive:true});
const commit='7a863158890502015ce66f4ebbe43b4be62cb252';
const snapshot=path.resolve(B,'source-'+commit);assert.ok(snapshot.startsWith(root+path.sep));
if(!fs.existsSync(snapshot)){
 fs.mkdirSync(snapshot);execFileSync('git',['archive','--format=tar','--output='+path.resolve(B,'source.tar'),commit]);
 execFileSync('tar',['-xf',path.resolve(B,'source.tar'),'-C',snapshot]);
}
if(!fs.existsSync(path.join(snapshot,'node_modules')))fs.symlinkSync(path.resolve('node_modules'),path.join(snapshot,'node_modules'),'junction');
const reviewed=JSON.parse(fs.readFileSync('docs/architecture/team-hub-checkpoint-evidence-2026-10-08/frontend-source-manifest.json'));
for(const f of reviewed.files){assert.equal(sha(f.path),f.sha256);assert.equal(sha(path.join(snapshot,f.path)),f.sha256,'Accepted source differs from checkpoint: '+f.path);}
const outputs='amplify_outputs.json';assert.deepEqual(JSON.parse(fs.readFileSync(outputs)),JSON.parse(fs.readFileSync(path.join(snapshot,outputs))),'Local outputs differ from checkpoint');
assert.ok(fs.readFileSync(outputs,'utf8').replaceAll('\r\n','\n')===fs.readFileSync(path.join(snapshot,outputs),'utf8').replaceAll('\r\n','\n'),'Only known Git CRLF normalization may differ');
const envFiles=fs.readdirSync(snapshot).filter(x=>x.startsWith('.env')&&x!=='.env.example');assert.deepEqual(envFiles,[]);
const activation={mode:'TARGET_WRITER',epoch:5,reviewed:true};
fs.writeFileSync(E+'/activation.PROPOSED.json',JSON.stringify({scope:'Ntgre only; NOT PUBLISHED OR AUTHORIZED FOR ACTIVATION',releaseBinding:activation,requiredLiveGate:{previousMode:'FROZEN',previousEpoch:4,targetMode:'TARGET_WRITER',targetEpoch:5,targetVersion:5},onMismatch:'STOP; do not alter this pin or adopt a browser value',serverSideTransactionsRequired:true},null,2)+'\n');
const builds=[];
for(const kind of ['activation','rollback']){
 const outDir=path.resolve(B,kind+'-website');const chunks=[];
 const plugins=[{name:'reviewed-release-imports',generateBundle(_,bundle){for(const item of Object.values(bundle))if(item.type==='chunk')chunks.push({file:item.fileName,isEntry:item.isEntry,imports:item.imports,modules:Object.keys(item.modules).map(p=>p.replaceAll('\\','/').replace(snapshot.replaceAll('\\','/')+'/',''))});}}];
 if(kind==='activation')plugins.unshift({name:'pinned-ntgre-activation',enforce:'pre',resolveId(source){
  if(source.endsWith('teamHub.service.js')||source.endsWith('migration-mode.mjs'))return path.join(snapshot,'src/features/team-hub/services/independent-service.mjs');
  if(source.endsWith('frontend-cutover.PROPOSAL.json'))return '\0reviewed-ntgre-activation';
 },load(id){if(id==='\0reviewed-ntgre-activation')return 'export default '+JSON.stringify(activation)+';';}});
 // Explicit root and empty Vite environment directory prevent machine-local .env substitution.
 await build({root:snapshot,configFile:path.join(snapshot,'vite.config.js'),envDir:snapshot,plugins,logLevel:'warn',build:{outDir,emptyOutDir:false}});
 const files=[];function walk(dir){for(const name of fs.readdirSync(dir).sort()){const p=path.join(dir,name);if(fs.statSync(p).isDirectory())walk(p);else files.push({path:path.relative(outDir,p).replaceAll('\\','/'),sha256:sha(p),bytes:fs.statSync(p).size});}}walk(outDir);
 assert.ok(files.some(x=>x.path==='index.html'));assert.ok(!files.some(x=>/\.map$|\.env|amplify_outputs/.test(x.path)));
 const byFile=new Map(chunks.map(x=>[x.file,x]));const closure=(name,seen=new Set())=>{if(seen.has(name))return seen;seen.add(name);for(const i of byFile.get(name)?.imports??[])closure(i,seen);return seen;};
 const entries=chunks.filter(x=>x.isEntry).map(x=>({file:x.file,modules:[...closure(x.file)].flatMap(f=>byFile.get(f)?.modules??[])}));
 fs.writeFileSync(E+'/'+kind+'-import-review.json',JSON.stringify({entries,chunks},null,2)+'\n');
 assert.ok(entries.every(x=>!x.modules.some(m=>/features\/(?:team-hub\/services\/independent-service|tournaments\/.*\.vue|creator-tools\/.*\.vue|commerce\/.*\.vue)/i.test(m))),'Product implementation eagerly loaded');
 const team=chunks.filter(x=>x.modules.some(m=>/TeamHubHome\.vue$/.test(m)));
 assert.equal(team.length,1);const teamModules=[...closure(team[0].file)].flatMap(f=>byFile.get(f)?.modules??[]);
 assert.ok(!teamModules.some(m=>/features\/(?:tournaments|creator-tools|commerce)\//i.test(m)&&!m.endsWith('.routes.js')),'Foreign product in Team static closure');
 const modules=chunks.flatMap(x=>x.modules);if(kind==='activation'){assert.ok(modules.some(m=>m.endsWith('independent-service.mjs')));assert.ok(modules.some(m=>m.endsWith('cutover-client.mjs')));assert.ok(!modules.some(m=>/scripts\/team-hub|features\/team-hub\/.*(?:browser-service|rehearsal|fixture)/.test(m)));}
 const manifest={kind,sourceCommit:commit,destination:'Ntgre localhost only',published:false,authorityBinding:kind==='activation'?activation:null,sourceMode:kind==='activation'?'INDEPENDENT_TEAM_HUB':'LEGACY',artifactDirectory:path.relative(root,outDir).replaceAll('\\','/'),files,staticImportEvidence:{entries,teamChunk:team[0].file,teamModules},endpointPins:['config/domains/team-hub/domain-endpoints.Ntgre.json','config/domains/core/domain-endpoints.Ntgre.json'].map(p=>({path:p,sha256:sha(path.join(snapshot,p))})),outputsSha256:sha(outputs),machineEnvironmentExcluded:true,unrelatedWorkingTreeExcluded:true};
 const file=E+'/'+kind+'-manifest.json';fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');builds.push({kind,manifest:file,sha256:sha(file),files:files.length,artifactDirectory:manifest.artifactDirectory});
}
fs.writeFileSync(E+'/frontend-pins.json',JSON.stringify({at:new Date().toISOString(),builds,sourceCommit:commit,acceptedSourceChecks:reviewed.files.length,awsWrites:0,published:false},null,2)+'\n');
console.log(JSON.stringify({complete:true,builds,awsWrites:0}));

