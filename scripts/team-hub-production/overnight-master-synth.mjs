// Compatibility synthesis only. No Legacy deployment candidate is produced.
import path from 'node:path';import {createRequire,registerHooks,syncBuiltinESMExports} from 'node:module';import {pathToFileURL} from 'node:url';import net from 'node:net';import tls from 'node:tls';
const toolRequire=createRequire(path.resolve(process.env.TEAM_HUB_TEST_TOOLS,'package.json'));
if(typeof process.geteuid!=='function')process.geteuid=()=>1000;
net.connect=net.createConnection=tls.connect=()=>{throw Error('MASTER_SYNTH_NETWORK_FORBIDDEN');};globalThis.fetch=()=>{throw Error('MASTER_SYNTH_NETWORK_FORBIDDEN');};syncBuiltinESMExports();
registerHooks({resolve(s,c,next){if(s==='aws-cdk-lib'||s.startsWith('aws-cdk-lib/'))return {url:pathToFileURL(toolRequire.resolve(s)).href,shortCircuit:true};return next(s,c);}});
process.env.AWS_ACCESS_KEY_ID='LOCAL_TEST_ONLY';process.env.AWS_SECRET_ACCESS_KEY='LOCAL_TEST_ONLY';delete process.env.AWS_SESSION_TOKEN;delete process.env.AWS_PROFILE;delete process.env.AWS_DEFAULT_PROFILE;process.env.AWS_EC2_METADATA_DISABLED='true';
await import('../synthesize-master-backend.mjs');
