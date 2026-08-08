import { isPlatformBrandOperator } from '../brands/policy'
import { getIdentityGroups, getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import {
  BRAND_USER_EDITABLE_EVENT_FIELDS,
  PLATFORM_EDITABLE_EVENT_FIELDS,
  assertBrandEventFieldsAreAllowed,
  getRequestedEventFields,
  hasBrandEventsManagePermission,
} from './managedPolicy'

async function listAll(client: any, modelName: string) {
  const records: any[] = []
  let nextToken: string | null | undefined
  do {
    const result = await client.models[modelName].list({ nextToken, limit: 1000 })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to list ${modelName}`)
    records.push(...(result.data || []))
    nextToken = result.nextToken
  } while (nextToken)
  return records
}

function getActor(event: any) {
  const identity = getResolverIdentity(event)
  const userId = getIdentityUsername(identity)
  if (!userId) throw new Error('Authenticated user identity is required')
  return { userId, isPlatformOperator: isPlatformBrandOperator(getIdentityGroups(identity)) }
}

async function requireBrand(client: any, brandId: string) {
  const result = await client.models.Brand.get({ id: brandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load brand')
  if (!result.data) throw new Error('Brand not found')
  return result.data
}

async function assertBrandEventManager(client: any, actor: ReturnType<typeof getActor>, brandId: string) {
  const [brand, accesses, permissions] = await Promise.all([
    requireBrand(client, brandId),
    listAll(client, 'BrandAccess'),
    listAll(client, 'BrandAccessPermission'),
  ])
  if (!hasBrandEventsManagePermission(actor.userId, brand, accesses, permissions)) {
    throw new Error('Brand event management permission is required')
  }
}

export async function authorizeBrandEventCommand(client: any, event: any, brandId: unknown) {
  if (typeof brandId !== 'string' || !brandId) {
    throw new Error('Event must belong to a Brand')
  }

  const actor = getActor(event)
  if (actor.isPlatformOperator) {
    await requireBrand(client, brandId)
  } else {
    await assertBrandEventManager(client, actor, brandId)
  }
  return actor
}

function validateCreateFields(args: Record<string, unknown>) {
  for (const field of ['title', 'description', 'startAt', 'endAt', 'locationType', 'status']) {
    if (typeof args[field] !== 'string' || !args[field]) throw new Error(`${field} is required`)
  }
}

function selectEventFields(args: Record<string, unknown>, allowedFields: readonly string[]) {
  const updates: Record<string, unknown> = {}
  for (const field of getRequestedEventFields(args)) {
    if (allowedFields.includes(field)) updates[field] = args[field]
  }
  return updates
}

async function getEvent(client: any, eventId: string) {
  const result = await client.models.Event.get({ id: eventId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load Event')
  if (!result.data) throw new Error('Event not found')
  return result.data
}

export async function handleCreateManagedEvent(event: any, injectedClient?: any) {
  const actor = getActor(event)
  const args = event.arguments || {}
  validateCreateFields(args)
  const client = injectedClient || await loadDataClient()
  const brandId = typeof args.brandId === 'string' && args.brandId ? args.brandId : ''

  if (!actor.isPlatformOperator) {
    if (!brandId) throw new Error('brandId is required for Brand Event management')
    assertBrandEventFieldsAreAllowed(args)
    await assertBrandEventManager(client, actor, brandId)
  } else if (brandId) {
    await requireBrand(client, brandId)
  }

  const fields = selectEventFields(args, actor.isPlatformOperator ? PLATFORM_EDITABLE_EVENT_FIELDS : BRAND_USER_EDITABLE_EVENT_FIELDS)
  const result = await client.models.Event.create({ ...fields, ...(brandId ? { brandId } : {}), createdBy: actor.userId, updatedBy: actor.userId })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to create Event')
  await writePermissionAudit(client, actor.userId, 'event.create', 'Event', result.data.id, null, result.data)
  return { success: true, message: 'Event created', eventId: result.data.id }
}

export async function handleUpdateManagedEvent(event: any, injectedClient?: any) {
  const actor = getActor(event)
  const args = event.arguments || {}
  if (typeof args.eventId !== 'string' || !args.eventId) throw new Error('eventId is required')
  const client = injectedClient || await loadDataClient()
  const existingEvent = await getEvent(client, args.eventId)
  const requestedBrandId = typeof args.brandId === 'string' && args.brandId ? args.brandId : ''

  if (!actor.isPlatformOperator) {
    if (!requestedBrandId) throw new Error('brandId is required for Brand Event management')
    if (existingEvent.brandId !== requestedBrandId) throw new Error('Event does not belong to the selected brand')
    assertBrandEventFieldsAreAllowed(args)
    await assertBrandEventManager(client, actor, requestedBrandId)
  } else if (requestedBrandId) {
    await requireBrand(client, requestedBrandId)
  }

  const fields = selectEventFields(args, actor.isPlatformOperator ? PLATFORM_EDITABLE_EVENT_FIELDS : BRAND_USER_EDITABLE_EVENT_FIELDS)
  if (Object.keys(fields).length === 0 && !(actor.isPlatformOperator && requestedBrandId)) {
    throw new Error('At least one Event field is required')
  }
  const result = await client.models.Event.update({
    id: args.eventId,
    ...fields,
    ...(actor.isPlatformOperator && requestedBrandId ? { brandId: requestedBrandId } : {}),
    updatedBy: actor.userId,
  })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to update Event')
  await writePermissionAudit(client, actor.userId, 'event.update', 'Event', args.eventId, existingEvent, { ...existingEvent, ...fields, ...(actor.isPlatformOperator && requestedBrandId ? { brandId: requestedBrandId } : {}) })
  return { success: true, message: 'Event updated', eventId: args.eventId }
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
