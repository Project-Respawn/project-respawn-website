import { getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import { getEffectivePermissions } from '../shared/requirePermission'
import { MANAGED_TWITCH_COMMAND_FIELDS, getRequestedTwitchCommandFields, hasBrandTwitchManagePermission } from './managedPolicy'

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

async function getActor(event: any, client: any) {
  const identity = getResolverIdentity(event)
  const userId = getIdentityUsername(identity)
  if (!userId) throw new Error('Authenticated user identity is required')
  const { effective } = await getEffectivePermissions(event, client)
  return { userId, isPlatformOperator: effective.has('bots.twitch.manage') }
}

async function requireBrand(client: any, brandId: string) {
  const result = await client.models.Brand.get({ id: brandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load brand')
  if (!result.data) throw new Error('Brand not found')
  return result.data
}

async function assertBrandTwitchManager(client: any, actor: Awaited<ReturnType<typeof getActor>>, brandId: string) {
  const [brand, accesses, permissions] = await Promise.all([
    requireBrand(client, brandId),
    listAll(client, 'BrandAccess'),
    listAll(client, 'BrandAccessPermission'),
  ])
  if (!hasBrandTwitchManagePermission(actor.userId, brand, accesses, permissions)) {
    throw new Error('Brand Twitch management permission is required')
  }
}

function requireBrandId(args: Record<string, unknown>) {
  if (typeof args.brandId !== 'string' || !args.brandId) throw new Error('brandId is required')
  return args.brandId
}

function selectFields(args: Record<string, unknown>) {
  const fields: Record<string, unknown> = {}
  for (const field of getRequestedTwitchCommandFields(args)) fields[field] = args[field]
  return fields
}

function requireCreateFields(args: Record<string, unknown>) {
  for (const field of ['streamerId', 'name', 'reply', 'category', 'permissionLevel']) {
    if (typeof args[field] !== 'string' || !args[field]) throw new Error(`${field} is required`)
  }
  for (const field of ['enabled', 'cooldownSeconds', 'isCustom']) {
    if (args[field] === undefined || args[field] === null) throw new Error(`${field} is required`)
  }
}

async function getCommand(client: any, commandId: string) {
  const result = await client.models.TwitchCommand.get({ id: commandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load Twitch command')
  if (!result.data) throw new Error('Twitch command not found')
  return result.data
}

async function authorizeScope(client: any, actor: Awaited<ReturnType<typeof getActor>>, brandId: string) {
  if (actor.isPlatformOperator) {
    await requireBrand(client, brandId)
  } else {
    await assertBrandTwitchManager(client, actor, brandId)
  }
}

async function assertBrandTwitchAccess(client: any, actor: Awaited<ReturnType<typeof getActor>>, brandId: string) {
  const [brand, accesses] = await Promise.all([requireBrand(client, brandId), listAll(client, 'BrandAccess')])
  if (!actor.isPlatformOperator && brand.ownerUserId !== actor.userId && !accesses.some((access) => access.brandId === brandId && access.userId === actor.userId)) {
    throw new Error('Brand access is required to view Twitch commands')
  }
}

export async function handleListManagedTwitchCommands(event: any, injectedClient?: any) {
  const args = event.arguments || {}
  const brandId = requireBrandId(args)
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  await assertBrandTwitchAccess(client, actor, brandId)
  const commands = await listAll(client, 'TwitchCommand')
  const includeUnscoped = actor.isPlatformOperator && args.includeUnscoped === true
  return commands
    .filter((command) => command.brandId === brandId || (includeUnscoped && !command.brandId))
    .map((command) => ({
      id: command.id,
      brandId: command.brandId || null,
      streamerId: command.streamerId,
      name: command.name,
      reply: command.reply,
      enabled: command.enabled,
      cooldownSeconds: command.cooldownSeconds,
      isCustom: command.isCustom,
      category: command.category,
      permissionLevel: command.permissionLevel,
    }))
}

export async function handleCreateManagedTwitchCommand(event: any, injectedClient?: any) {
  const args = event.arguments || {}
  requireCreateFields(args)
  const brandId = requireBrandId(args)
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  await authorizeScope(client, actor, brandId)
  const result = await client.models.TwitchCommand.create({ ...selectFields(args), brandId })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to create Twitch command')
  await writePermissionAudit(client, actor.userId, 'twitch.command.create', 'TwitchCommand', result.data.id, null, result.data)
  return { success: true, message: 'Twitch command created', commandId: result.data.id }
}

export async function handleUpdateManagedTwitchCommand(event: any, injectedClient?: any) {
  const args = event.arguments || {}
  if (typeof args.commandId !== 'string' || !args.commandId) throw new Error('commandId is required')
  const brandId = requireBrandId(args)
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  const command = await getCommand(client, args.commandId)

  if (!command.brandId && !actor.isPlatformOperator) {
    throw new Error('Unscoped Twitch commands require platform-admin remediation before Brand management')
  }
  if (command.brandId && command.brandId !== brandId && !actor.isPlatformOperator) {
    throw new Error('Twitch command does not belong to the selected brand')
  }
  await authorizeScope(client, actor, brandId)

  const fields = selectFields(args)
  if (Object.keys(fields).length === 0 && command.brandId === brandId) throw new Error('At least one Twitch command field is required')
  const result = await client.models.TwitchCommand.update({ id: args.commandId, ...fields, brandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to update Twitch command')
  await writePermissionAudit(client, actor.userId, 'twitch.command.update', 'TwitchCommand', args.commandId, command, { ...command, ...fields, brandId })
  return { success: true, message: 'Twitch command updated', commandId: args.commandId }
}

export async function handleDeleteManagedTwitchCommand(event: any, injectedClient?: any) {
  const args = event.arguments || {}
  if (typeof args.commandId !== 'string' || !args.commandId) throw new Error('commandId is required')
  const brandId = requireBrandId(args)
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  const command = await getCommand(client, args.commandId)
  if (!command.brandId) throw new Error('Unscoped Twitch commands must be assigned to a Brand by a platform administrator before deletion')
  if (command.brandId !== brandId) throw new Error('Twitch command does not belong to the selected brand')
  await authorizeScope(client, actor, brandId)
  const result = await client.models.TwitchCommand.delete({ id: args.commandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to delete Twitch command')
  await writePermissionAudit(client, actor.userId, 'twitch.command.delete', 'TwitchCommand', args.commandId, command, null)
  return { success: true, message: 'Twitch command deleted', commandId: args.commandId }
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
