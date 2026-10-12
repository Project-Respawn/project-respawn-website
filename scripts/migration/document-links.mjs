import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {sha256} from './deployment-checks.mjs';
export function localLinks(text) {
  const prose=text.replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/`[^`\n]+`/g,'');
  const links=[...prose.matchAll(/\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)].map(m=>m[1].replace(/^<|>$/g,''));
  for(const m of prose.matchAll(/^\s*\[[^\]]+\]:\s*(<[^>]+>|\S+)/gm))links.push(m[1].replace(/^<|>$/g,''));
  return links.filter(x=>! /^(?:[a-z]+:|\/\/)/i.test(x));
}
export function checkLinks(files,exists=fs.existsSync,origins=[],localOnly=[]) {
  const errors=[];let checked=0,archivedLinksResolved=0,intentionallyExcludedReferences=0;
  for(const origin of origins) { const bytes=fs.readFileSync(origin.file); assert.ok(sha256(bytes)===origin.sha256 || origin.normalizedLfSha256 && sha256(bytes.toString('utf8').replaceAll('\r\n','\n'))===origin.normalizedLfSha256,'Historical snapshot changed: '+origin.file); }
  for(const file of files) for(const link of localLinks(fs.readFileSync(file,'utf8'))) {
    const [raw]=link.split('#');if(!raw)continue;
    let decoded;try{decoded=decodeURIComponent(raw);}catch{errors.push({file,link,reason:'INVALID_ENCODING'});continue;}
    const origin=origins.find(x=>x.file===file);
    const target=path.resolve(origin?.originalDirectory??path.dirname(file),decoded);checked++;if(origin)archivedLinksResolved++;
    const retained=localOnly.find(x=>x.file===file&&x.link===link);
    if(retained){assert.equal(target,path.resolve(retained.target));assert.ok(retained.rule.startsWith('.gitignore:'));assert.ok(exists(retained.navigation),'Missing retention navigation');intentionallyExcludedReferences++;continue;}
    if(!exists(target))errors.push({file,link,reason:'MISSING_TARGET'});
  }
  return {complete:errors.length===0,files:files.length,checked,archivedLinksResolved,intentionallyExcludedReferences,errors,scope:'Portable local targets plus explicit historical local-only exclusions with tracked navigation; recorded archive origins; fragments/external URLs not certified'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
  const files=process.argv.includes('--filesystem')?walk('docs/architecture').filter(f=>f.endsWith('.md')):[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z','docs/architecture']).toString().split('\0').filter(f=>f.endsWith('.md')))];
  assert.ok(files.length,'No documentation selected; use --filesystem for a Git-free export');
  const origins=JSON.parse(fs.readFileSync('docs/architecture/phase2-archive-link-origins.json')).origins;
  const localOnly=JSON.parse(fs.readFileSync('docs/architecture/phase2-local-evidence-references.json')).entries;
  const result=checkLinks(files,fs.existsSync,origins,localOnly);fs.mkdirSync('.tmp',{recursive:true});fs.writeFileSync('.tmp/migration-document-links.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(!result.complete)process.exitCode=1;
}
