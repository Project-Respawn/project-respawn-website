import fs from 'node:fs';
import crypto from 'node:crypto';
import {build} from 'vite';
const E='docs/architecture/team-hub-checkpoint-evidence-2026-10-08';
const independent=process.argv.includes('--independent');
const files=[
 'domains/team-hub/authority-contract/contract.mjs',
 'domains/team-hub/authority-contract/handler.mjs',
 'domains/team-hub/authority-contract/router.mjs',
 'src/features/Team Hub/champion-pool/ChampionPool.vue',
 'src/features/Team Hub/champion-pool/CoachPoolReview.vue',
 'src/features/Team Hub/team-hub.routes.js',
 'src/features/Team Hub/TeamAdministration.vue',
 'src/features/Team Hub/TeamHubHome.vue',
 'src/features/Team Hub/TeamManagement.vue',
 'src/router/index.js','src/router/admin.routes.js','src/router/public.routes.js',
 'src/router/forum.routes.js','src/App.vue',
 'src/features/team-hub/services/migration-mode.mjs',
 'src/features/team-hub/services/website-adapter.mjs',
 'src/features/team-hub/services/route-access.mjs',
 'src/features/team-hub/services/independent-service.mjs',
 'config/domains/team-hub/frontend-cutover.PROPOSAL.json',
 'src/features/team-hub/api/cutover-client.mjs',
 'src/views/UserHomepage/UserHomepage.js',
];
fs.writeFileSync(E+'/frontend-source-manifest.json',JSON.stringify({
 at:new Date().toISOString(),liveActivation:false,
 scope:'Explicit Phase 2B5B frontend review pins; does not advance Legacy backend evidence',
 files:files.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}))
},null,2)+'\n');
const plugin={name:'team-hub-import-evidence',generateBundle(_,bundle){
 const chunks=Object.values(bundle).filter(x=>x.type==='chunk');
 const byName=new Map(chunks.map(x=>[x.fileName,x]));
 const closure=(entry,seen=new Set())=>{if(seen.has(entry))return seen;seen.add(entry);for(const child of byName.get(entry)?.imports??[])closure(child,seen);return seen;};
 const rows=chunks.filter(c=>c.isEntry||Object.keys(c.modules).some(p=>/TeamHubHome\.vue|Tournament.*\.vue/.test(p))).map(c=>{
  const loaded=[...closure(c.fileName)],modules=[...new Set(loaded.flatMap(n=>Object.keys(byName.get(n)?.modules??{})))].map(p=>p.replace(process.cwd().replaceAll('\\','/')+'/',''));
  return {file:c.fileName,bytes:Buffer.byteLength(c.code),isEntry:c.isEntry,staticChunks:loaded,sourceModules:modules.filter(p=>p.startsWith('src/')),domainModules:modules.filter(p=>p.startsWith('src/features/'))};
 });
 fs.writeFileSync(E+(independent?'/frontend-candidate-build.json':'/frontend-build.json'),JSON.stringify({at:new Date().toISOString(),build:'PASS',liveActivation:false,scope:'Production bundle static import closures; browser network acceptance remains separate',chunks:rows},null,2)+'\n');
}};
await build({...(independent?{configFile:'scripts/team-hub-2b5b/frontend-candidate.vite.mjs'}:{}),plugins:[plugin],build:{outDir:'.tmp/team-hub-checkpoint/'+(independent?'independent-website':'website-build'),emptyOutDir:true}});
