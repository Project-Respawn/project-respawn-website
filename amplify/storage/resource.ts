import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'projectRespawnStorage',
  access: (allow) => ({
    // Public files: guests can read; authenticated users & SuperAdmin can read/write/delete
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['SuperAdmin']).to(['read', 'write', 'delete']),
    ],

    // Private identity files
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});