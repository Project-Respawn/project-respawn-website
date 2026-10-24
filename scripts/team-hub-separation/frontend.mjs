// Offline bundle evidence only. Does not run a dev server or publish an artifact.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {build} from 'vite';import {localTeamHubAliases} from '../lib/team-hub-local-binding.mjs';
const E=process.env.TEAM_HUB_SEPARATION_EVIDENCE??'docs/architecture/team-hub-separation-verification-2026-10-24';
assert(path.resolve(E).startsWith(path.resolve('docs/architecture')+path.sep));fs.mkdirSync(E,{recursive:true});assert(!fs.existsSync(E+'/frontend.json'),'Use a fresh evidence directory');
const root=process.cwd().replaceAll('\\','/'),relative=p=>p.replaceAll('\\','/').replace(/^\0/,'').replace(root+'/','');
const route=p=>/(?:\.routes\.js|routes\.mjs)(?:\?|$)/.test(p);
const team=p=>/^src\/features\/(?:team-hub|Team Hub)\//.test(p)&&!route(p);
const foreign=p=>(/^src\/features\/(?!team-hub\/|Team Hub\/)/.test(p)||/^src\/views\/(?:Tournaments|Creators|Merch|Checkout|Forum|Events|SWG)/.test(p))&&!route(p);
const results=[];
for(const mode of ['hosted-source','ntgre-local-binding']){
 const json=f=>JSON.parse(fs.readFileSync(f,'utf8'));
 const aliases=mode==='ntgre-local-binding'?localTeamHubAliases({command:'serve',root:process.cwd(),outputs:json('amplify_outputs.json'),core:json('config/domains/core/domain-endpoints.Ntgre.json'),manifest:json('config/domains/team-hub/domain-endpoints.Ntgre.json'),activation:json('config/domains/team-hub/frontend-development.Ntgre.json')}):[];
 const output=path.resolve('.tmp/team-hub-separation-'+Date.now()+'-'+mode);assert(output.startsWith(path.resolve('.tmp')+path.sep));assert(!fs.existsSync(output));
 const result={mode,scope:mode==='hosted-source'?'Current working-tree hosted selection; not the deployed Master artifact':'Offline build with the exact aliases selected by the accepted Ntgre local server; not a live browser session',checks:[],chunks:[]};
 const plugin={name:'record-team-hub-lazy-closure',generateBundle(_,bundle){
  const chunks=Object.values(bundle).filter(c=>c.type==='chunk'),byName=new Map(chunks.map(c=>[c.fileName,c]));
  const closure=(name,seen=new Set())=>{if(seen.has(name))return seen;seen.add(name);for(const n of byName.get(name)?.imports??[])closure(n,seen);return seen;};
  for(const c of chunks){const own=Object.keys(c.modules).map(relative),loaded=[...closure(c.fileName)],modules=[...new Set(loaded.flatMap(n=>Object.keys(byName.get(n)?.modules??{})).map(relative))];const teamPage=own.some(p=>/^src\/features\/Team Hub\/.*\.vue(?:\?|$)/.test(p));const foreignPage=own.some(p=>foreign(p)&&/\.vue(?:\?|$)/.test(p));
   result.chunks.push({file:c.fileName,isEntry:c.isEntry,imports:c.imports,dynamicImports:c.dynamicImports,modules:own,bytes:Buffer.byteLength(c.code)});
   if(c.isEntry)result.checks.push({name:'entry-excludes-team-implementation',file:c.fileName,passed:!modules.some(team),unexpected:modules.filter(team)});
   if(teamPage)result.checks.push({name:'team-static-closure-excludes-other-products',file:c.fileName,passed:!modules.some(foreign),unexpected:modules.filter(foreign)});
   if(foreignPage)result.checks.push({name:'other-product-static-closure-excludes-team',file:c.fileName,passed:!modules.some(team),unexpected:modules.filter(team)});
  }
  const pages=result.chunks.filter(c=>c.modules.some(p=>/^src\/features\/Team Hub\/.*\.vue(?:\?|$)/.test(p)));
  result.checks.push({name:'team-pages-are-nonentry-chunks',passed:pages.length>=5&&pages.every(c=>!c.isEntry),chunks:pages.length});
  if(mode==='ntgre-local-binding')result.checks.push({name:'independent-service-is-emitted',passed:result.chunks.some(c=>c.modules.includes('src/features/team-hub/services/independent-service.mjs'))});
 }};
 await build({...(aliases.length?{resolve:{alias:aliases}}:{}),plugins:[plugin],build:{outDir:output,emptyOutDir:false,manifest:true}});
 result.passed=result.checks.every(c=>c.passed);results.push(result);
}
const inputs=['vite.config.js','src/router/index.js','src/router/features.routes.js','src/features/Team Hub/team-hub.routes.js','src/features/team-hub/services/independent-service.mjs','src/features/team-hub/services/migration-mode.mjs','scripts/lib/team-hub-local-binding.mjs'];
const report={at:new Date().toISOString(),awsWrites:0,livePublication:false,browserNetworkAcceptance:false,sourceRevision:'Working tree; includes existing unrelated changes, none deployed',inputs:inputs.map(p=>({path:p,sha256:createHash('sha256').update(fs.readFileSync(p)).digest('hex')})),results,passed:results.every(r=>r.passed)};
fs.writeFileSync(E+'/frontend.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed:report.passed,checks:results.map(r=>({mode:r.mode,checks:r.checks.length,failures:r.checks.filter(c=>!c.passed)}))}));assert(report.passed,'Lazy-load boundary requires correction; see recorded unexpected modules');
