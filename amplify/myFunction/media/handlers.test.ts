import assert from 'node:assert/strict'
import { handleCreateManagedMediaItem, handleDeleteManagedMediaItem, handleListManagedMediaLibrary, handleListPublicMerchProductImages, handleUpdateManagedMediaItem } from './handlers'

function event(username: string, groups: string[], arguments_: any = {}) { return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ } }
function makeClient({ assigned = false, productVisible = true } = {}) {
  const audits: any[] = []; const creates: any[] = []; const updates: any[] = []; const deletes: any[] = []
  const data: Record<string, any[]> = {
    PermissionDefinition: [{ key: 'media.library.manage', isActive: true }],
    GroupPermission: [{ groupName: 'Staff', permissionKey: 'media.library.manage', enabled: true }],
    MediaCollection: [{ id: 'collection-a', name: 'Products' }],
    MediaItem: [{ id: 'media-a', url: 'public/media/products/product-a/image.png', title: 'Image' }, { id: 'media-other', url: 'public/media/other.png', title: 'Unrelated' }],
    MerchProductImage: assigned ? [{ id: 'link-a', productId: 'product-a', mediaItemId: 'media-a', isVisible: true }, { id: 'link-other', productId: 'product-other', mediaItemId: 'media-other', isVisible: true }] : [],
  }
  const model = (name: string) => ({
    list: async () => ({ data: data[name] || [] }),
    get: async ({ id }: any) => ({ data: name === 'MerchProduct' ? { id, isVisible: productVisible } : (data[name] || []).find((item) => item.id === id) }),
    create: async (input: any) => { creates.push(input); return { data: { id: 'created-media', ...input } } },
    update: async (input: any) => { updates.push(input); return { data: input } },
    delete: async (input: any) => { deletes.push(input); return { data: input } },
  })
  return { audits, creates, updates, deletes, models: new Proxy({ PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } } } as any, { get(target, name: string) { return target[name] || model(name) } }) }
}

await assert.rejects(handleListManagedMediaLibrary(event('member', ['Member']), makeClient()), /permission/i)
const authorized = makeClient(); const library = await handleListManagedMediaLibrary(event('staff', ['Staff']), authorized)
assert.equal((library.mediaItems as any[]).length, 2)
await handleCreateManagedMediaItem(event('staff', ['Staff'], { url: 'public/media/new.png', title: 'New' }), authorized)
await handleUpdateManagedMediaItem(event('staff', ['Staff'], { mediaItemId: 'media-a', title: 'Updated' }), authorized)
assert.equal(authorized.audits.length, 2)
await assert.rejects(handleCreateManagedMediaItem(event('member', ['Member'], { url: 'public/media/no.png' }), makeClient()), /permission/i)
await assert.rejects(handleUpdateManagedMediaItem(event('member', ['Member'], { mediaItemId: 'media-a' }), makeClient()), /permission/i)
await assert.rejects(handleDeleteManagedMediaItem(event('staff', ['Staff'], { mediaItemId: 'media-a' }), makeClient({ assigned: true })), /assigned to a product/i)
const deleteClient = makeClient(); await handleDeleteManagedMediaItem(event('staff', ['Staff'], { mediaItemId: 'media-a' }), deleteClient)
assert.equal(deleteClient.deletes.length, 1); assert.equal(deleteClient.audits.at(-1).action, 'media.delete')
await assert.rejects(handleDeleteManagedMediaItem(event('member', ['Member'], { mediaItemId: 'media-a' }), makeClient()), /permission/i)

const publicImages = await handleListPublicMerchProductImages({ arguments: { productId: 'product-a' } }, makeClient({ assigned: true }))
assert.equal(publicImages.length, 1); assert.equal(publicImages[0].url, 'public/media/products/product-a/image.png')
assert.equal(publicImages.some((image: any) => image.mediaItemId === 'media-other'), false, 'public Product imagery must not expose unrelated media')
assert.deepEqual(await handleListPublicMerchProductImages({ arguments: { productId: 'product-a' } }, makeClient({ assigned: true, productVisible: false })), [], 'hidden Products must not expose imagery')
console.log('Media authorization handler tests passed')
