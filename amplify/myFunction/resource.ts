import { defineFunction, secret } from '@aws-amplify/backend';

const isProductionBranch = process.env.AWS_BRANCH === 'master';
const appEnvironment = isProductionBranch ? 'prod' : process.env.APP_ENV || 'sandbox';
const revolutMode = isProductionBranch ? 'prod' : process.env.REVOLUT_MODE || 'sandbox';

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

    // =========================================================================
    // Twitch / shared app config
    // =========================================================================
    APP_ENV: appEnvironment,
    REVOLUT_MODE: revolutMode,
  },
});
