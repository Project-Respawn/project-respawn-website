import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * Collect `preferred_username` (and other profile fields) in the app at sign-up instead.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
