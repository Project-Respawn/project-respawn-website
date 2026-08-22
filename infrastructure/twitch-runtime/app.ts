import { App } from 'aws-cdk-lib';
import { TwitchRuntimeStagingStack } from './twitch-runtime-staging-stack.js';

const app = new App();

new TwitchRuntimeStagingStack(app, 'ProjectRespawnTwitchRuntimeStaging', {
  env: { account: '058264289478', region: 'eu-north-1' },
  description: 'Project Respawn Twitch Technical Alpha staging runtime and minimal operational monitoring',
});
