import { defineAuth, referenceAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';
import { adminUserManagement } from '../functions/admin-user-management/resource';
import sharedResources from './shared-resources.json';
import { resolveAuthMode } from './mode';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = resolveAuthMode() === 'shared' ? referenceAuth({
  ...sharedResources,
  access: (allow) => [
    allow.resource(adminUserManagement).to(['manageUsers', 'addUserToGroup']),
  ],
}) : defineAuth({
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
    allow.resource(adminUserManagement).to([
      'manageUsers',
      'addUserToGroup',
    ]),
  ],
});
