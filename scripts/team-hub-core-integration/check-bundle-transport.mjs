import fs from 'node:fs';import {createRequire} from 'node:module';import path from 'node:path';import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';import {proofVersion} from '../../domains/team-hub/core-integration/handler.mjs';
Object.assign(process.env,{AWS_PROFILE:'default',AWS_REGION:'eu-north-1',TEAM_HUB_AUTHORITY:'LEGACY_WRITER',TEAM_HUB_STAGE:'PRE_CUTOVER',TEAM_HUB_NORMAL_WRITES:'DISABLED'});
fs.copyFileSync('.tmp/team-hub-core-integration/index.js','.tmp/team-hub-core-integration/transport-check.cjs');const require=createRequire(import.meta.url),{handler}=require(path.resolve('.tmp/team-hub-core-integration/transport-check.cjs'));
const claims={sub:'00000000-0000-0000-0000-000000000001',iss:acceptedCore.environmentContract.issuer,client_id:acceptedCore.environmentContract.clientId,token_use:'access',exp:Math.floor(Date.now()/1000)+60};
const accessToken='eyJhbGciOiJSUzI1NiJ9.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.invalid';
const r=await handler({contractVersion:proofVersion,accessToken,operation:'authorization'});console.log(JSON.stringify({bundleResponse:r,expected:'FORBIDDEN (Core rejects invalid signature)'}));
