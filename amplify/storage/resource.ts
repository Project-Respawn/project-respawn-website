import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'projectRespawnStorage',
  access: (allow) => ({
    'public/*: [allow.authenticated.to(['read', 'write'])],
    'private/{entity_id}/': [allow.entity('identity').to(['read', 'write'])],
  }),
});
