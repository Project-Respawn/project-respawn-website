import { defineFunction, secret } from '@aws-amplify/backend';

// =============================================================================
// Function definition
// =============================================================================

export const myFunction = defineFunction({
  name: 'myFunction',
  entry: './handler.ts',
  resourceGroupName: 'data',

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
    APP_ENV: 'sandbox',
  },
});