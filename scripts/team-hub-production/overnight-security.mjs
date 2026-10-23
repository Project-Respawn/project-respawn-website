// Run the accepted matrix with the selected profile and new evidence paths only.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
const scratch='.tmp/team-hub-overnight/security',out='docs/architecture/team-hub-overnight-evidence-2026-10-22';fs.mkdirSync(scratch,{recursive:true});
let adapter=fs.readFileSync('scripts/team-hub-production/team-readiness-aws.mjs','utf8').replace("'--profile','default'","'--profile','codex-master-oauth'").replaceAll('.tmp/production-team-readiness/requests',scratch+'/requests');fs.writeFileSync(scratch+'/aws.mjs',adapter);
const url=p=>pathToFileURL(path.resolve(p)).href;
let source=fs.readFileSync('scripts/team-hub-production/team-readiness-security.mjs','utf8');
source=source.replace("import {E,read,save} from './team-readiness-prepare.mjs';","import {E,read} from '"+url('scripts/team-hub-production/team-readiness-prepare.mjs')+"';const save=(name,value)=>fs.writeFileSync('"+out+"/'+name,JSON.stringify(value,null,2)+'\\n');")
 .replace("from './team-readiness-aws.mjs'","from './aws.mjs'").replace("from './deployment-prepare.mjs'","from '"+url('scripts/team-hub-production/deployment-prepare.mjs')+"'")
 .replace("fs.existsSync(E+'/security-validation.json')","false")
 .replace("const file=E+'/resolved-'","const file='"+scratch+"/resolved-'");
fs.writeFileSync(scratch+'/matrix.mjs',source);execFileSync(process.execPath,[scratch+'/matrix.mjs'],{stdio:'inherit',windowsHide:true});
