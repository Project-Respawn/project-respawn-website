import { defineFunction, secret } from '@aws-amplify/backend';
import { twitchRuntimeClientId } from '../../myFunction/config/runtimeClientIdentity.js';

export const twitchRuntime = defineFunction({
  name: 'twitch-runtime',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    TWITCH_CLIENT_ID: secret('TWITCH_CLIENT_ID'),
    TWITCH_CLIENT_SECRET: secret('TWITCH_CLIENT_SECRET'),
    TWITCH_RUNTIME_AUTH_SECRET: secret('TWITCH_RUNTIME_AUTH_SECRET'),
    TWITCH_RUNTIME_CLIENT_ID: twitchRuntimeClientId(),
    TWITCH_TOKEN_KMS_KEY_ID: process.env.TWITCH_TOKEN_KMS_KEY_ID || '',
  },
});
