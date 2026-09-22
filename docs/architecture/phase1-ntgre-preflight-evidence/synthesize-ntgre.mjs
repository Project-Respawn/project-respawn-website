import process from 'node:process';import path from 'node:path';import {mkdir,writeFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {tsImport} from 'tsx/esm/api';import {CloudAssembly} from 'aws-cdk-lib/cx-api';import {MemoryContext,StackSelectionStrategy,Toolkit} from '@aws-cdk/toolkit-lib';import {CDKContextKey} from '@aws-amplify/platform-core';
if(process.env.AWS_BRANCH||process.env.RESPAWN_AUTH_MODE==='shared')throw Error('Refusing branch/shared-auth environment');
process.env.CDK_DEFAULT_ACCOUNT='058264289478';process.env.CDK_DEFAULT_REGION='eu-north-1';process.env.AWS_EC2_METADATA_DISABLED='true';
const label=process.argv[2];if(!['baseline','candidate'].includes(label))throw Error('Invalid label');const outdir=path.resolve('.amplify/ntgre-preview');await mkdir(outdir,{recursive:false});
const context=new MemoryContext({[CDKContextKey.BACKEND_NAMESPACE]:'project-respawn-website',[CDKContextKey.BACKEND_NAME]:'Ntgre',[CDKContextKey.DEPLOYMENT_TYPE]:'sandbox'});
const toolkit=new Toolkit({ioHost:{notify:async()=>undefined,requestResponse:async()=>undefined},emojis:false,color:false});
const source=await toolkit.fromAssemblyBuilder(async()=>{await tsImport(pathToFileURL(path.resolve('amplify/backend.ts')).toString(),import.meta.url);process.emit('message','amplifySynth',undefined);return new CloudAssembly(outdir);},{contextStore:context,outdir});
await toolkit.synth(source,{stacks:{strategy:StackSelectionStrategy.ALL_STACKS}});console.log('SYNTHESIS ONLY Ntgre',label,outdir);
