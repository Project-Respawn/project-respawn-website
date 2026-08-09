import assert from 'node:assert/strict'
import { handleDeleteManagedMerchProductImage, handleUpsertManagedMerchProductImage } from './handlers'
import { testPermissionModels } from '../shared/testPermissionModels'

function event(username: string, groups: string[], arguments_: any) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

function makeClient() {
  const audits: any[] = []
  return {
    audits,
    models: {
      ...testPermissionModels(['products.edit']),
      MerchProduct: { get: async () => ({ data: { id: 'product-a' } }) },
      MediaItem: { get: async () => ({ data: { id: 'media-a', url: 'public/media/a.png' } }) },
      MerchProductImage: {
        get: async () => ({ data: { id: 'image-a', productId: 'product-a', mediaItemId: 'media-a' } }),
        create: async (input: any) => ({ data: { id: 'image-created', ...input } }),
        update: async (input: any) => ({ data: input }),
        delete: async (input: any) => ({ data: input }),
      },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
  }
}

for (const group of ['SuperAdmin', 'Admin', 'Staff']) {
  const client = makeClient()
  await handleUpsertManagedMerchProductImage(event(`${group}-user`, [group], { productId: 'product-a', mediaItemId: 'media-a', isVisible: true }), client)
  await handleDeleteManagedMerchProductImage(event(`${group}-user`, [group], { imageId: 'image-a' }), client)
  assert.deepEqual(client.audits.map((audit) => audit.action), ['product.image.assign', 'product.image.remove'])
}

for (const actor of [
  { username: 'owner', groups: ['Member'] },
  { username: 'helper', groups: ['Member'] },
]) {
  await assert.rejects(
    handleUpsertManagedMerchProductImage(event(actor.username, actor.groups, { productId: 'product-a', mediaItemId: 'media-a', brandPermissionKeys: ['brand.products.manage'] }), makeClient()),
    /Permission products\.edit is required/i,
  )
  await assert.rejects(
    handleDeleteManagedMerchProductImage(event(actor.username, actor.groups, { imageId: 'image-a', brandPermissionKeys: ['brand.products.manage'] }), makeClient()),
    /Permission products\.edit is required/i,
  )
}

console.log('Product image platform-only policy tests passed')
