import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { schemaOperations,outputOperations,compareOperations } from '../lib/amplify-contract.mjs'
const root=process.cwd(),base=process.argv[2]||'origin/master',out=path.join(root,'.amplify/commerce-baseline')
function git(args){const run=spawnSync('git',args,{encoding:'utf8',maxBuffer:8000000,windowsHide:true});if(run.status!==0)throw Error('Baseline Git read failed');return run.stdout}
const files=git(['ls-tree','-r','--name-only',base,'amplify/myFunction','amplify/data']).trim().split('\n')
for(const file of files){const dest=path.join(out,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,git(['show',`${base}:${file}`]))}
const guard=pathToFileURL(path.join(root,'scripts/commerce/offline-guard.mjs')).href
const prelude=`import '${guard}';import{registerHooks,createRequire}from'node:module';import{pathToFileURL}from'node:url';registerHooks({resolve(s,c,n){if(s.startsWith('$amplify/env/'))return{url:'data:text/javascript,export const env={}',shortCircuit:true};return n(s,c)}});process.env.APP_ENV='sandbox';process.env.REVOLUT_MODE='sandbox';const require=createRequire(process.cwd()+'/package.json');const{register}=await import(pathToFileURL(require.resolve('tsx/esm/api')).href);register();`
const run=spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(prelude),'--test','amplify/myFunction/shared/authoritativePermissions.test.ts'],{cwd:out,encoding:'utf8',maxBuffer:1000000,timeout:60000,windowsHide:true})
const schema=schemaOperations(git(['show',`${base}:amplify/data/resource.ts`])),outputs=outputOperations(JSON.parse(git(['show',`${base}:amplify_outputs.json`])))
const empty={queries:new Set(),mutations:new Set(),subscriptions:new Set()}
const result={base,baseCommit:git(['rev-parse',base]).trim(),unchangedBrandPermissionTestExitCode:run.status,baselineFailure:(run.stdout||'')+(run.stderr||''),schemaContract:compareOperations(schema,empty,outputs),note:'This records baseline failures; it does not suppress or waive the current test/contract failures.'}
fs.writeFileSync(path.join(root,'.amplify/commerce-baseline-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({baseCommit:result.baseCommit,testExitCode:run.status,baselineMissingQueries:result.schemaContract.queries.schemaMissingFromOutputs,baselineMissingMutations:result.schemaContract.mutations.schemaMissingFromOutputs},null,2))
