import { getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import { getEffectivePermissions } from '../shared/requirePermission'
import { hasBrandDiscordManagePermission } from './policy'

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
  return { userId, isPlatformOperator: effective.has('brands.manage') }
}

function requireBrandId(args: Record<string, unknown>) {
  if (typeof args.brandId !== 'string' || !args.brandId) throw new Error('brandId is required')
  return args.brandId
}

async function requireBrand(client: any, brandId: string) {
  const result = await client.models.Brand.get({ id: brandId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load brand')
  if (!result.data) throw new Error('Brand not found')
  return result.data
}

async function assertDiscordConfigurationManager(client: any, actor: Awaited<ReturnType<typeof getActor>>, brandId: string) {
  const [brand, accesses, permissions] = await Promise.all([
    requireBrand(client, brandId),
    listAll(client, 'BrandAccess'),
    listAll(client, 'BrandAccessPermission'),
  ])
  if (!actor.isPlatformOperator && !hasBrandDiscordManagePermission(actor.userId, brand, accesses, permissions)) {
    throw new Error('Brand Discord management permission is required')
  }
}

function configurationResult(brandId: string, configuration: any | null, message: string) {
  return { success: true, message, brandId, configurationId: configuration?.id || null }
}

export async function handleGetManagedDiscordConfiguration(event: any, injectedClient?: any) {
  const args = event.arguments || {}
  const brandId = requireBrandId(args)
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  await assertDiscordConfigurationManager(client, actor, brandId)
  const configurations = await listAll(client, 'DiscordBotConfiguration')
  const configuration = configurations.find((item) => item.brandId === brandId) || null
  return configurationResult(brandId, configuration, configuration ? 'Discord configuration loaded' : 'Discord configuration has not been created')
}

export async function handleCreateOrUpdateManagedDiscordConfiguration(event: any, injectedClient?: any) {
  const args = event.arguments || {}
  const brandId = requireBrandId(args)
  const client = injectedClient || await loadDataClient()
  const actor = await getActor(event, client)
  await assertDiscordConfigurationManager(client, actor, brandId)
  const configurations = await listAll(client, 'DiscordBotConfiguration')
  const existing = configurations.find((item) => item.brandId === brandId)
  const result = existing
    ? await client.models.DiscordBotConfiguration.update({ id: existing.id, brandId })
    : await client.models.DiscordBotConfiguration.create({ id: `discord-bot-configuration:${brandId}`, brandId })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to save Discord configuration')
  await writePermissionAudit(client, actor.userId, existing ? 'discord.configuration.update' : 'discord.configuration.create', 'DiscordBotConfiguration', result.data.id, existing || null, result.data)
  return configurationResult(brandId, result.data, existing ? 'Discord configuration updated' : 'Discord configuration created')
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
