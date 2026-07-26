import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'projectRespawnStorage',

  access: (allow) => ({
    /*
     * 1. PUBLIC MEDIA LIBRARY
     *    - All shared, publicly readable assets (product images, branding, etc.)
     */
    'public/media/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
        'read',
        'write',
        'delete',
      ]),
    ],

    /*
     * 2. PUBLIC MEDIA: PRODUCT SUBFOLDERS
     *    - Example key: public/media/products/<productId>/<filename>.jpg
     */
    'public/media/products/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
        'read',
        'write',
        'delete',
      ]),
    ],

    /*
     * 3. PRIVATE USER FILES
     *    - Example key: private/{entity_id}/... (user-only access)
     */
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});