import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'projectRespawnStorage',
  access: (allow) => ({
    'public/merch/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'list', 'write', 'delete']),
      allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['read', 'list', 'write', 'delete']),
    ],

    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'list', 'write', 'delete']),
      allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['read', 'list', 'write', 'delete']),
    ],

    'products/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'list', 'write', 'delete']),
      allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['read', 'list', 'write', 'delete']),
    ],

    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});