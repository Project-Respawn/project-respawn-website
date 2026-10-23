import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const cwd=process.cwd(),guard=pathToFileURL(path.join(cwd,'scripts/commerce/offline-guard.mjs')).href
const prelude=`import '${guard}';import{registerHooks,createRequire}from'node:module';import{pathToFileURL}from'node:url';registerHooks({resolve(s,c,n){if(s.startsWith('$amplify/env/'))return{url:'data:text/javascript,export const env={}',shortCircuit:true};return n(s,c)}});process.env.APP_ENV='sandbox';process.env.REVOLUT_MODE='sandbox';const require=createRequire(process.cwd()+'/package.json');const{register}=await import(pathToFileURL(require.resolve('tsx/esm/api')).href);register();`
const groups=['teamHub','twitch','router','stage9','permissions','shared','brands','events','discord','media','investors','applications','workspaces','merch']
const results=[]
for(const group of groups){const dir=`amplify/myFunction/${group}`;for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.test.ts'))){
  const file=`${dir}/${name}`,run=spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(prelude),'--test',file],{cwd,encoding:'utf8',timeout:60000,maxBuffer:4000000,windowsHide:true})
  const output=(run.stdout||'')+(run.stderr||'');results.push({file,passed:run.status===0,...(run.status===0?{}:{diagnostic:output.slice(-5000)})})
  console.log(`${run.status===0?'PASS':'FAIL'} ${file}`)
}}
fs.mkdirSync('.amplify',{recursive:true})
fs.writeFileSync('.amplify/commerce-compatibility.json',JSON.stringify(results,null,2))
console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length}))
if(results.some(r=>!r.passed))process.exitCode=1
