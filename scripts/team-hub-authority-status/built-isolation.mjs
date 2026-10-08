import fs from 'node:fs';import assert from 'node:assert/strict';
const E='docs/architecture/team-hub-authority-status-evidence-2026-10-08';
const candidate=JSON.parse(fs.readFileSync(E+'/frontend-candidate-build.json'));
const isRoute=p=>/\.routes\.js$/.test(p);
const team=p=>/src\/features\/(?:team-hub|Team Hub)\//.test(p)&&!isRoute(p);
const foreign=p=>(/src\/features\/(?:tournaments|creator-tools|commerce|community)\//.test(p)||/src\/views\/(?:Tournaments|Creators|Merch|Checkout|Forum|Events)\//.test(p))&&!isRoute(p);
const checks=[];
for(const c of candidate.chunks){const modules=c.sourceModules??c.domainModules??[];if(c.isEntry){assert.ok(!modules.some(p=>team(p)||foreign(p)),'EAGER_DOMAIN_IMPLEMENTATION');checks.push({name:'SHARED_ENTRY_LAZY',file:c.file,passed:true});}else if(c.file.includes('TeamHubHome')){assert.ok(!modules.some(foreign),'TEAM_LOADS_FOREIGN_DOMAIN');checks.push({name:'TEAM_STATIC_CLOSURE',file:c.file,passed:true});}else if(c.file.includes('Tournament')){assert.ok(!modules.some(team),'TOURNAMENT_LOADS_TEAM');checks.push({name:'TOURNAMENT_STATIC_CLOSURE',file:c.file,passed:true});}}
const full=JSON.parse(fs.readFileSync(E+'/full-browser.json')),chunks=JSON.parse(fs.readFileSync(E+'/full-built-chunks.json')).chunks;
for(const p of full.personas){const loaded=new Set(p.network.filter(n=>n.host==='localhost'&&n.path.startsWith('/assets/')).map(n=>n.path.slice(1)));const modules=chunks.filter(c=>loaded.has(c.file)).flatMap(c=>c.modules);const unexpected=modules.filter(foreign);assert.deepEqual(unexpected,[],'FOREIGN_BROWSER_IMPLEMENTATION_'+p.persona);checks.push({name:'BROWSER_LOADED_CHUNKS',persona:p.persona,loadedChunks:loaded.size,passed:true});}
fs.writeFileSync(E+'/built-isolation.json',JSON.stringify({at:new Date().toISOString(),checks,passed:true,scope:'Uninstrumented candidate static closures in both directions; built-harness observed loaded chunks for executed personas. Route declarations and shared shell/Core/Cognito allowed.'},null,2)+'\n');console.log(JSON.stringify({passed:true,checks:checks.length}));
