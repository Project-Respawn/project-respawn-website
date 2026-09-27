import {App} from 'aws-cdk-lib';
import {TournamentStack, type CoreIdentity} from './stack.js';
import fs from 'node:fs';
import crypto from 'node:crypto';
// This entrypoint has no Amplify/backend import and instantiates exactly one sibling root.
const config = JSON.parse(fs.readFileSync(process.env.TOURNAMENT_CONFIG!, 'utf8')) as CoreIdentity;
const pin = JSON.parse(fs.readFileSync(process.env.TOURNAMENT_PIN!, 'utf8'));
if (crypto.createHash('sha256').update(fs.readFileSync(process.env.TOURNAMENT_CONFIG!)).digest('hex') !== pin.coreSha256 || pin.stackName !== 'ProjectRespawn-Tournaments-Ntgre') throw new Error('Unreviewed identity provenance');
if (config.environment !== 'Ntgre' || config.account !== '058264289478' || config.region !== 'eu-north-1' || !process.env.TOURNAMENT_REVISION?.match(/^[a-f0-9]{64}$/)) throw new Error('Unvalidated target');
const app = new App({outdir: process.env.TOURNAMENT_OUTDIR, analyticsReporting: false});
new TournamentStack(app, 'ProjectRespawn-Tournaments-Ntgre', config, process.env.TOURNAMENT_ASSET!, process.env.TOURNAMENT_REVISION!, process.env.TOURNAMENT_CORE_SHA!);
app.synth();
