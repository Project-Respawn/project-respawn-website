import { defineFunction, secret } from '@aws-amplify/backend';

const isProductionBranch = process.env.AWS_BRANCH === 'master';
const appEnvironment = isProductionBranch ? 'prod' : process.env.APP_ENV || 'sandbox';
const revolutMode = isProductionBranch ? 'prod' : process.env.REVOLUT_MODE || 'sandbox';
const twitchRedirectUri = isProductionBranch
  ? 'https://g9eoo6e1h2.execute-api.eu-north-1.amazonaws.com/twitch/oauth/callback'
  : 'https://9qp7ehd406.execute-api.eu-north-1.amazonaws.com/twitch/oauth/callback';
const twitchFrontendUrl = isProductionBranch
  ? 'https://www.projectrespawn.com'
  : 'http://localhost:5174';

// =============================================================================
// Function definition
// =============================================================================

export const myFunction = defineFunction({
  name: 'myFunction-rebuild',
  entry: './handler.ts',
  resourceGroupName: 'data',
  timeoutSeconds: 30,

  environment: {
    // =========================================================================
    // Printful
    // =========================================================================
    PRINTFUL_API_KEY: secret('PRINTFUL_API_KEY'),

    // =========================================================================
    // Revolut
    // =========================================================================
    REVOLUT_API_KEY: secret('REVOLUT_API_KEY'),
    REVOLUT_API_SECRET: secret('REVOLUT_API_SECRET'),
    REVOLUT_WEBHOOK_SIGNING_SECRET: secret('REVOLUT_WEBHOOK_SIGNING_SECRET'),

    // =========================================================================
    // Twitch / shared app config
    // =========================================================================
    TWITCH_CLIENT_ID: secret('TWITCH_CLIENT_ID'),
    TWITCH_CLIENT_SECRET: secret('TWITCH_CLIENT_SECRET'),
    TWITCH_OAUTH_STATE_SECRET: secret('TWITCH_OAUTH_STATE_SECRET'),
    TWITCH_RUNTIME_AUTH_SECRET: secret('TWITCH_RUNTIME_AUTH_SECRET'),
    ALPHA_REWARD_EVENT_AUTH_SECRET: secret('ALPHA_REWARD_EVENT_AUTH_SECRET'),
    ALPHA_REWARD_EVENT_CLIENT_ID: 'alpha-app',
    TWITCH_RUNTIME_CLIENT_ID: 'respawn-twitch-bot',
    TWITCH_TOKEN_KMS_KEY_ID: process.env.TWITCH_TOKEN_KMS_KEY_ID || '',
    TWITCH_REDIRECT_URI: twitchRedirectUri,
    TWITCH_FRONTEND_URL: twitchFrontendUrl,
    APP_ENV: appEnvironment,
    REVOLUT_MODE: revolutMode,
  },
});
