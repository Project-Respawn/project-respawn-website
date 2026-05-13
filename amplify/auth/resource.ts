import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },

  groups: [
    'SuperAdmin',
    'Admin',
    'Staff',
    'Moderator',
    'Trainer',
    'Therapist',
    'StreamingPartner',
    'AffiliatePartner',
    'Member',
    'BetaMember',
  ],

  triggers: {
    postConfirmation,
  },

  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
  ],
});
