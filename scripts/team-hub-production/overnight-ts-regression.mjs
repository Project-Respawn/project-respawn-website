// Mock-only Legacy/shared/Commerce/Twitch compatibility. Deny external sockets.
import fs from 'node:fs';import path from 'node:path';import net from 'node:net';import tls from 'node:tls';import {createRequire,registerHooks,syncBuiltinESMExports} from 'node:module';import {pathToFileURL} from 'node:url';
if(typeof process.geteuid!=='function')process.geteuid=()=>1000;
const blocked=()=>{throw Error('OVERNIGHT_PROVIDER_NETWORK_FORBIDDEN');};net.connect=blocked;net.createConnection=blocked;tls.connect=blocked;globalThis.fetch=blocked;syncBuiltinESMExports();
// Generated deployment environment modules are absent offline. Tests inject their
// own clients; this empty module cannot initialize a usable live data client.
registerHooks({resolve(specifier,context,nextResolve){if(['$amplify/env/myFunction-rebuild','$amplify/env/twitch-runtime'].includes(specifier))return {url:'data:text/javascript,export const env=Object.freeze({});',shortCircuit:true};return nextResolve(specifier,context);}});
const toolRequire=createRequire(path.resolve(process.env.TEAM_HUB_TEST_TOOLS??process.cwd(),'package.json'));
const {register}=await import(pathToFileURL(toolRequire.resolve('tsx/esm/api')).href);register();
const dirs=['shared','merch','twitch'];const files=dirs.flatMap(d=>fs.readdirSync('amplify/myFunction/'+d).filter(f=>f.endsWith('.test.ts')).map(f=>'../../amplify/myFunction/'+d+'/'+f));
files.push('../../amplify/myFunction/router/restRouter.twitch.test.ts');
for(const file of files)await import(file);
