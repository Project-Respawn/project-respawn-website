import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const label=process.argv[2],out='/results/'+label;fs.mkdirSync(out,{recursive:true});process.chdir('/work');
const env={...process.env,AWS_EC2_METADATA_DISABLED:'true',TSX_TSCONFIG_PATH:'/work/amplify/tsconfig.json'};delete env.AWS_BRANCH;delete env.RESPAWN_AUTH_MODE;
fs.writeFileSync(out+'/environment.json',JSON.stringify({node:process.version,npm:spawnSync('npm',['--version'],{encoding:'utf8'}).stdout.trim(),platform:process.platform,arch:process.arch,env:{AWS_EC2_METADATA_DISABLED:env.AWS_EC2_METADATA_DISABLED,TSX_TSCONFIG_PATH:env.TSX_TSCONFIG_PATH,AWS_BRANCH:null,RESPAWN_AUTH_MODE:null}},null,2));
const ledger=[];function run(name,args){const fd=fs.openSync(out+'/'+name+'.txt','w');const r=spawnSync(process.execPath,args,{env,stdio:['ignore',fd,fd],timeout:900000});fs.closeSync(fd);ledger.push({name,args,exit:r.status,error:r.error?.message});fs.writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));console.log(label,name,r.status);if(r.status!==0)process.exit(r.status||1);}
run('verify-input-bytes',['scripts/snapshot-validation-source.mjs','verify','/work']);
run('npm-ci',['/usr/local/lib/node_modules/npm/bin/npm-cli.js','ci']);
run('verify-installed-source',['scripts/snapshot-validation-source.mjs','verify','/work']);
run('master-synthesis',['scripts/synthesize-master-backend.mjs']);
run('verify-post-synthesis-source',['scripts/snapshot-validation-source.mjs','verify','/work']);
fs.cpSync('/work/.amplify/master-preview/cdk.out',out+'-assembly',{recursive:true});console.log(label,'assembly exported');
