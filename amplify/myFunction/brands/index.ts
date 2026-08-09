import { writePermissionAudit } from '../shared/audit'
import { getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { getEffectivePermissions } from '../shared/requirePermission'
import { BRAND_PERMISSION_KEYS, assertCanChangeBrandOwner, canManageBrandPermissions } from './policy'

export { BRAND_PERMISSION_KEYS } from './policy'

async function listAll(client: any, modelName: string) {
  const records: any[] = []
  let nextToken: string | null | undefined
  do {
    const options: { limit: number; nextToken?: string } = { limit: 1000 }
    if (typeof nextToken === 'string' && nextToken) options.nextToken = nextToken
    const result = await client.models[modelName].list(options)
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to list ${modelName}`)
    records.push(...(result.data || []))
    nextToken = result.nextToken
  } while (nextToken)
  return records
}

function brandAuditSnapshot(brand: any) {
  return {
    id: brand.id ?? null,
    name: brand.name ?? null,
    slug: brand.slug ?? null,
    description: brand.description ?? null,
    sortOrder: brand.sortOrder ?? null,
    isActive: brand.isActive ?? null,
    ownerUserId: brand.ownerUserId ?? null,
    ownerAssignedBy: brand.ownerAssignedBy ?? null,
    ownerAssignedAt: brand.ownerAssignedAt ?? null,
  }
}

async function getActor(event: any, client: any) {
  const identity = getResolverIdentity(event)
  const userId = getIdentityUsername(identity)
  if (!userId) throw new Error('Authenticated user identity is required')
  const { effective } = await getEffectivePermissions(event, client)
  return { identity, userId, isPlatformOperator: effective.has('brands.manage') }
}

function assertPlatformBrandOperator(actor: ReturnType<typeof getActor>) {
  assertCanChangeBrandOwner(actor.isPlatformOperator)
}

function normalizePermissionKeys(value: unknown) {
  if (!Array.isArray(value) || value.some((key) => typeof key !== 'string')) {
    throw new Error('permissionKeys must be an array of supported brand permissions')
  }
  const keys = [...new Set(value)]
  const invalidKey = keys.find((key) => !BRAND_PERMISSION_KEYS.includes(key as typeof BRAND_PERMISSION_KEYS[number]))
  if (invalidKey) throw new Error(`Unknown brand permission key: ${invalidKey}`)
  return keys
}

async function requireBrand(client: any, brandId: string) {
  const result = await client.models.Brand.get({ id: brandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load brand')
  if (!result.data) throw new Error('Brand not found')
  return result.data
}

async function writeAudit(client: any, actorUserId: string, action: string, brandId: string, before: unknown, after: unknown) {
  return writePermissionAudit(client, actorUserId, action, 'Brand', brandId, before, after)
}

async function getBrandPermissionRows(client: any, brandId: string) {
  const accessIds = new Set((await getBrandAccessRows(client, brandId)).map((access) => access.id))
  return (await listAll(client, 'BrandAccessPermission')).filter((row) => accessIds.has(row.brandAccessId))
}

async function getBrandAccessRows(client: any, brandId?: string) {
  const rows = await listAll(client, 'BrandAccess')
  return brandId ? rows.filter((row) => row.brandId === brandId) : rows
}

async function assertBrandPermissionManager(client: any, actor: Awaited<ReturnType<typeof getActor>>, brandId: string) {
  const brand = await requireBrand(client, brandId)
  if (!canManageBrandPermissions(actor.isPlatformOperator, actor.userId, brand.ownerUserId)) {
    throw new Error('You can manage helpers only for brands you own')
  }
  return brand
}

function brandSummary(brand: any, userId: string, permissionKeys: string[]) {
  return {
    brandId: brand.id,
    name: brand.name,
    ownerUserId: brand.ownerUserId || null,
    isOwner: brand.ownerUserId === userId,
    permissionKeys: [...new Set(permissionKeys)].sort(),
  }
}

export async function getAccessibleBrandSummaries(client: any, userId: string, isPlatformOperator: boolean) {
  const brands = await listAll(client, 'Brand')
  const accesses = await getBrandAccessRows(client)
  const permissionRows = await listAll(client, 'BrandAccessPermission')
  const permissionsByAccessId = new Map<string, string[]>()
  for (const row of permissionRows) {
    const keys = permissionsByAccessId.get(row.brandAccessId) || []
    keys.push(row.permissionKey)
    permissionsByAccessId.set(row.brandAccessId, keys)
  }
  const accessesByBrandId = new Map<string, any[]>()
  for (const access of accesses.filter((row) => row.userId === userId)) {
    const rows = accessesByBrandId.get(access.brandId) || []
    rows.push(access)
    accessesByBrandId.set(access.brandId, rows)
  }

  return brands
    .filter((brand) => isPlatformOperator || brand.ownerUserId === userId || accessesByBrandId.has(brand.id))
    .map((brand) => {
      if (isPlatformOperator || brand.ownerUserId === userId) {
        return brandSummary(brand, userId, [...BRAND_PERMISSION_KEYS])
      }
      const permissionKeys = (accessesByBrandId.get(brand.id) || [])
        .flatMap((access) => permissionsByAccessId.get(access.id) || [])
      return brandSummary(brand, userId, permissionKeys)
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function handleCreateBrand(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  assertPlatformBrandOperator(actor)
  const args = event.arguments || {}
  if (typeof args.name !== 'string' || !args.name.trim() || typeof args.slug !== 'string' || !args.slug.trim()) {
    throw new Error('Brand name and slug are required')
  }
  if (args.ownerUserId != null && typeof args.ownerUserId !== 'string') {
    throw new Error('ownerUserId must be a Cognito user identifier when provided')
  }

  const ownerUserId = typeof args.ownerUserId === 'string' && args.ownerUserId.trim()
    ? args.ownerUserId.trim()
    : null
  const result = await client.models.Brand.create({
    name: args.name.trim(),
    slug: args.slug.trim(),
    description: typeof args.description === 'string' ? args.description.trim() : null,
    sortOrder: typeof args.sortOrder === 'number' ? args.sortOrder : 0,
    isActive: args.isActive !== false,
    ownerUserId,
    ownerAssignedBy: ownerUserId ? actor.userId : null,
    ownerAssignedAt: ownerUserId ? new Date().toISOString() : null,
  })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to create brand')
  await writeAudit(client, actor.userId, 'brand.create', result.data.id, null, brandAuditSnapshot(result.data))
  return { success: true, message: 'Brand created', brandId: result.data.id }
}

export async function handleUpdateBrand(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  assertPlatformBrandOperator(actor)
  const args = event.arguments || {}
  if (typeof args.brandId !== 'string') throw new Error('brandId is required')
  const before = await requireBrand(client, args.brandId)
  const updates: { id: string; [key: string]: any } = { id: args.brandId }
  for (const key of ['name', 'slug', 'description', 'sortOrder', 'isActive']) {
    if (args[key] !== undefined) updates[key] = args[key]
  }
  const result = await client.models.Brand.update(updates)
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to update brand')
  await writeAudit(client, actor.userId, 'brand.update', args.brandId, before, { ...before, ...updates })
  return { success: true, message: 'Brand updated', brandId: args.brandId }
}

export async function handleSetBrandOwner(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  assertPlatformBrandOperator(actor)
  const { brandId, ownerUserId } = event.arguments || {}
  if (typeof brandId !== 'string' || typeof ownerUserId !== 'string' || !ownerUserId.trim()) {
    throw new Error('brandId and ownerUserId are required')
  }
  const brand = await requireBrand(client, brandId)
  const result = await client.models.Brand.update({
    id: brandId,
    ownerUserId: ownerUserId.trim(),
    ownerAssignedBy: actor.userId,
    ownerAssignedAt: new Date().toISOString(),
  })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to change brand owner')
  await writeAudit(client, actor.userId, 'brand.owner.assign', brandId, { ownerUserId: brand.ownerUserId || null }, { ownerUserId: ownerUserId.trim() })
  return { success: true, message: 'Brand owner updated', brandId }
}

export async function handleGetBrandPermissionDetails(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  const { brandId } = event.arguments || {}
  if (typeof brandId !== 'string') throw new Error('brandId is required')
  const brand = await assertBrandPermissionManager(client, actor, brandId)
  const [accesses, permissionRows] = await Promise.all([
    getBrandAccessRows(client, brandId),
    getBrandPermissionRows(client, brandId),
  ])
  const permissionsByAccessId = new Map<string, string[]>()
  for (const row of permissionRows) {
    const keys = permissionsByAccessId.get(row.brandAccessId) || []
    keys.push(row.permissionKey)
    permissionsByAccessId.set(row.brandAccessId, keys)
  }
  return {
    brand: brandSummary(brand, actor.userId, actor.isPlatformOperator || brand.ownerUserId === actor.userId ? [...BRAND_PERMISSION_KEYS] : []),
    helpers: accesses
      .filter((access) => access.userId !== brand.ownerUserId)
      .map((access) => ({
        userId: access.userId,
        username: access.username || null,
        email: access.email || null,
        displayName: access.displayName || null,
        permissionKeys: [...new Set(permissionsByAccessId.get(access.id) || [])].sort(),
      }))
      .sort((left, right) => (left.displayName || left.userId).localeCompare(right.displayName || right.userId)),
    availablePermissionKeys: [...BRAND_PERMISSION_KEYS],
  }
}

export async function handleUpsertBrandHelper(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  const args = event.arguments || {}
  const { brandId, userId } = args
  if (typeof brandId !== 'string' || typeof userId !== 'string' || !userId.trim()) {
    throw new Error('brandId and userId are required')
  }
  const permissionKeys = normalizePermissionKeys(args.permissionKeys)
  const brand = await assertBrandPermissionManager(client, actor, brandId)
  if (brand.ownerUserId === userId.trim()) throw new Error('The Brand Owner already has full brand access')

  const existingAccesses = (await getBrandAccessRows(client, brandId)).filter((access) => access.userId === userId.trim())
  let access = existingAccesses[0]
  const before = access ? { userId: access.userId, permissionKeys: (await getBrandPermissionRows(client, brandId)).filter((row) => row.brandAccessId === access.id).map((row) => row.permissionKey) } : null
  if (!access) {
    const result = await client.models.BrandAccess.create({
      id: `brand-access:${brandId}:${userId.trim()}`,
      brandId,
      userId: userId.trim(),
      username: typeof args.username === 'string' ? args.username.trim() : null,
      email: typeof args.email === 'string' ? args.email.trim() : null,
      displayName: typeof args.displayName === 'string' ? args.displayName.trim() : null,
      accessLevel: 'helper',
      assignedBy: actor.userId,
      assignedAt: new Date().toISOString(),
    })
    if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to add brand helper')
    access = result.data
  } else {
    const result = await client.models.BrandAccess.update({
      id: access.id,
      username: typeof args.username === 'string' ? args.username.trim() : access.username,
      email: typeof args.email === 'string' ? args.email.trim() : access.email,
      displayName: typeof args.displayName === 'string' ? args.displayName.trim() : access.displayName,
      assignedBy: actor.userId,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to update brand helper')
  }

  const existingPermissionRows = (await getBrandPermissionRows(client, brandId)).filter((row) => row.brandAccessId === access.id)
  const existingKeys = new Set(existingPermissionRows.map((row) => row.permissionKey))
  await Promise.all([
    ...existingPermissionRows.filter((row) => !permissionKeys.includes(row.permissionKey)).map((row) => client.models.BrandAccessPermission.delete({ id: row.id })),
    ...permissionKeys.filter((key) => !existingKeys.has(key)).map((permissionKey) => client.models.BrandAccessPermission.create({
      id: `brand-access-permission:${access.id}:${permissionKey}`,
      brandAccessId: access.id,
      permissionKey,
      assignedBy: actor.userId,
      assignedAt: new Date().toISOString(),
    })),
  ])
  await writeAudit(client, actor.userId, before ? 'brand.helper.permissions.update' : 'brand.helper.assign', brandId, before, { userId: userId.trim(), permissionKeys })
  return { success: true, message: 'Brand helper updated', brandId }
}

export async function handleRemoveBrandHelper(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  const { brandId, userId } = event.arguments || {}
  if (typeof brandId !== 'string' || typeof userId !== 'string') throw new Error('brandId and userId are required')
  const brand = await assertBrandPermissionManager(client, actor, brandId)
  if (brand.ownerUserId === userId) throw new Error('The Brand Owner cannot be removed as a helper')
  const accesses = (await getBrandAccessRows(client, brandId)).filter((access) => access.userId === userId)
  const permissionRows = await getBrandPermissionRows(client, brandId)
  await Promise.all(accesses.flatMap((access) => [
    ...permissionRows.filter((row) => row.brandAccessId === access.id).map((row) => client.models.BrandAccessPermission.delete({ id: row.id })),
    client.models.BrandAccess.delete({ id: access.id }),
  ]))
  if (accesses.length) await writeAudit(client, actor.userId, 'brand.helper.remove', brandId, { userId, accessCount: accesses.length }, null)
  return { success: true, message: accesses.length ? 'Brand helper removed' : 'Brand helper was not assigned', brandId }
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
