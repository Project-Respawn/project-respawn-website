import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'projectRespawnStorage',

  access: (allow) => ({
    /*
     * 1. PUBLIC FILES
     *    - Covers public/media/products/<productId>/..., public/products/<...>/..., and other public assets.
     */
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
        'read',
        'write',
        'delete',
      ]),
    ],

    /*
     * 2. PRIVATE USER FILES
     *    - Example key: private/{entity_id}/... (user-only access)
     */
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
