import { getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import { resolveEffectivePermissionKeys } from '../shared/effectivePermissions'
import { PLATFORM_CONTROL_PERMISSION_KEYS } from '../permissions'

async function listAll(client: any, modelName: string) {
  const records: any[] = []
  let nextToken: string | null | undefined
  do {
    const result = await client.models[modelName].list({ nextToken, limit: 1000 })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to list ${modelName}`)
    records.push(...(result.data || [])); nextToken = result.nextToken
  } while (nextToken)
  return records
}

async function requireMediaPermission(event: any, client: any) {
  const identity = getResolverIdentity(event)
  const userId = getIdentityUsername(identity)
  if (!userId) throw new Error('Authenticated user identity is required')
  const [definitions, assignments] = await Promise.all([listAll(client, 'PermissionDefinition'), listAll(client, 'GroupPermission')])
  const effective = resolveEffectivePermissionKeys(identity, definitions, assignments, PLATFORM_CONTROL_PERMISSION_KEYS)
  if (!effective.has('media.library.manage')) throw new Error('Media Library permission is required')
  return userId
}

const EDITABLE_FIELDS = ['collectionId', 'title', 'altText', 'type', 'tags', 'color', 'colorHex', 'sourceType', 'externalImageId', 'status'] as const
function selectFields(args: any) { const value: any = {}; for (const key of EDITABLE_FIELDS) if (args[key] !== undefined) value[key] = args[key]; return value }

export async function handleListManagedMediaLibrary(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient(); await requireMediaPermission(event, client)
  const [collections, mediaItems] = await Promise.all([listAll(client, 'MediaCollection'), listAll(client, 'MediaItem')])
  return { collections, mediaItems }
}

export async function handleCreateManagedMediaItem(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient(); const actor = await requireMediaPermission(event, client); const args = event.arguments || {}
  if (typeof args.url !== 'string' || !args.url.startsWith('public/')) throw new Error('A public media storage path is required')
  const result = await client.models.MediaItem.create({ ...selectFields(args), url: args.url, createdBy: actor })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to create media item')
  await writePermissionAudit(client, actor, 'media.create', 'MediaItem', result.data.id, null, result.data)
  return { success: true, message: 'Media item created', mediaItemId: result.data.id }
}

export async function handleCreateManagedMediaCollection(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient(); const actor = await requireMediaPermission(event, client); const args = event.arguments || {}
  if (typeof args.name !== 'string' || !args.name || typeof args.slug !== 'string' || !args.slug) throw new Error('Collection name and slug are required')
  const result = await client.models.MediaCollection.create({ name: args.name, slug: args.slug, type: args.type, parentId: args.parentId, sortOrder: args.sortOrder, isActive: args.isActive })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to create media collection')
  await writePermissionAudit(client, actor, 'media.collection.create', 'MediaCollection', result.data.id, null, result.data)
  return { success: true, message: 'Media collection created', mediaItemId: result.data.id }
}

export async function handleUpdateManagedMediaItem(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient(); const actor = await requireMediaPermission(event, client); const args = event.arguments || {}
  if (typeof args.mediaItemId !== 'string' || !args.mediaItemId) throw new Error('mediaItemId is required')
  const before = await client.models.MediaItem.get({ id: args.mediaItemId }); if (!before.data) throw new Error('Media item not found')
  const result = await client.models.MediaItem.update({ id: args.mediaItemId, ...selectFields(args) })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to update media item')
  await writePermissionAudit(client, actor, 'media.update', 'MediaItem', args.mediaItemId, before.data, result.data)
  return { success: true, message: 'Media item updated', mediaItemId: args.mediaItemId }
}

export async function handleDeleteManagedMediaItem(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient(); const actor = await requireMediaPermission(event, client); const mediaItemId = event.arguments?.mediaItemId
  if (typeof mediaItemId !== 'string' || !mediaItemId) throw new Error('mediaItemId is required')
  const before = await client.models.MediaItem.get({ id: mediaItemId }); if (!before.data) throw new Error('Media item not found')
  const links = (await listAll(client, 'MerchProductImage')).filter((link) => link.mediaItemId === mediaItemId)
  if (links.length) throw new Error('Media item is assigned to a product and cannot be deleted')
  const result = await client.models.MediaItem.delete({ id: mediaItemId }); if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to delete media item')
  await writePermissionAudit(client, actor, 'media.delete', 'MediaItem', mediaItemId, before.data, null)
  return { success: true, message: 'Media item deleted', mediaItemId }
}

export async function handleListPublicMerchProductImages(event: any, injectedClient?: any) {
  const productId = event.arguments?.productId; if (typeof productId !== 'string' || !productId) throw new Error('productId is required')
  const client = injectedClient || await loadDataClient(); const product = await client.models.MerchProduct.get({ id: productId })
  if (!product.data || product.data.isVisible !== true) return []
  const [links, media] = await Promise.all([listAll(client, 'MerchProductImage'), listAll(client, 'MediaItem')]); const byId = new Map(media.map((item) => [item.id, item]))
  return links.filter((link) => link.productId === productId && link.isVisible !== false && link.status !== 'inactive').map((link) => {
    const item: any = byId.get(link.mediaItemId); if (!item?.url) return null
    return { ...link, url: item.url, title: item.title, altText: item.altText, type: item.type, color: item.color, colorHex: item.colorHex }
  }).filter(Boolean)
}

async function loadDataClient() { const { getDataClient } = await import('../shared/dataClient'); return getDataClient() }
