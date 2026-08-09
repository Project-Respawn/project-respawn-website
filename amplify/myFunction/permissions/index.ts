import { getAccessibleBrandSummaries } from '../brands'
import {
  assertPlatformAdmin,
  getIdentityGroups,
  getIdentityUsername,
  getResolverIdentity,
  isPlatformAdmin,
} from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import { assertPlatformControlAssignments, resolveEffectivePermissionKeys } from '../shared/effectivePermissions'
import { PLATFORM_CONTROL_PERMISSION_KEYS } from '../shared/permissionConstants'

export { PLATFORM_CONTROL_PERMISSION_KEYS } from '../shared/permissionConstants'

const COGNITO_GROUPS = [
  'SuperAdmin',
  'Admin',
  'Staff',
  'Moderator',
  'Trainer',
  'Therapist',
  'StreamingPartner',
  'AffiliatePartner',
  'Member',
  'BetaMember',
] as const

type CognitoGroup = (typeof COGNITO_GROUPS)[number]

interface CatalogDefinition {
  key: string
  displayName: string
  description: string
  domain: string
  module: string
  sortOrder: number
  defaultGroups: CognitoGroup[]
}

const ALL_MEMBERS: CognitoGroup[] = [
  'SuperAdmin', 'Admin', 'Staff', 'Moderator', 'Trainer', 'Therapist',
  'StreamingPartner', 'AffiliatePartner', 'Member', 'BetaMember',
]

const PLATFORM_OPERATIONS: CognitoGroup[] = ['SuperAdmin', 'Admin', 'Staff']
const PLATFORM_ADMINS: CognitoGroup[] = ['SuperAdmin', 'Admin']

export const INITIAL_PERMISSION_CATALOG: CatalogDefinition[] = [
  {
    key: 'users.view', displayName: 'View users',
    description: 'View the administrative user directory.', domain: 'Users', module: 'users', sortOrder: 10,
    defaultGroups: PLATFORM_ADMINS,
  },
  {
    key: 'users.manage', displayName: 'Manage user roles',
    description: 'Manage permitted Cognito group assignments through the website.', domain: 'Users', module: 'users', sortOrder: 20,
    defaultGroups: ['SuperAdmin'],
  },
  {
    key: 'permissions.manage', displayName: 'Manage global permissions',
    description: 'View and change the global Cognito-group permission matrix.', domain: 'Permissions', module: 'permissions', sortOrder: 10,
    defaultGroups: PLATFORM_ADMINS,
  },
  {
    key: 'forums.view', displayName: 'View forums',
    description: 'View public forum boards, threads, and posts.', domain: 'Forums', module: 'forums', sortOrder: 10,
    defaultGroups: ALL_MEMBERS,
  },
  {
    key: 'forums.thread.create', displayName: 'Create forum threads',
    description: 'Create forum threads where board rules allow it.', domain: 'Forums', module: 'forums', sortOrder: 20,
    defaultGroups: ALL_MEMBERS,
  },
  {
    key: 'forums.moderate', displayName: 'Moderate forums',
    description: 'Lock, pin, feature, and moderate forum content.', domain: 'Forums', module: 'forums', sortOrder: 30,
    defaultGroups: ['SuperAdmin', 'Admin', 'Staff', 'Moderator'],
  },
  {
    key: 'forums.structure.manage', displayName: 'Manage forum structure',
    description: 'Manage forum categories, boards, and board rules.', domain: 'Forums', module: 'forums', sortOrder: 40,
    defaultGroups: ['SuperAdmin'],
  },
  {
    key: 'events.view', displayName: 'View events',
    description: 'View public event listings.', domain: 'Events', module: 'events', sortOrder: 10,
    defaultGroups: ALL_MEMBERS,
  },
  {
    key: 'events.manage', displayName: 'Manage events',
    description: 'Create, edit, delete, clone, and schedule events.', domain: 'Events', module: 'events', sortOrder: 20,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'events.tags.manage', displayName: 'Manage event tags',
    description: 'Create, edit, and delete event tags.', domain: 'Events', module: 'events', sortOrder: 30,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'brands.view', displayName: 'View brands',
    description: 'View public brand records.', domain: 'Brands', module: 'brands', sortOrder: 10,
    defaultGroups: ALL_MEMBERS,
  },
  {
    key: 'brands.manage', displayName: 'Manage brands',
    description: 'Create, edit, activate, and archive brands.', domain: 'Brands', module: 'brands', sortOrder: 20,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'merch.categories.manage', displayName: 'Manage merch categories',
    description: 'Create, edit, activate, and archive merch categories.', domain: 'Merch', module: 'merch-categories', sortOrder: 10,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'products.view', displayName: 'View products',
    description: 'View public storefront products.', domain: 'Products', module: 'products', sortOrder: 10,
    defaultGroups: ALL_MEMBERS,
  },
  {
    key: 'products.edit', displayName: 'Edit products',
    description: 'Edit product details and availability.', domain: 'Products', module: 'products', sortOrder: 20,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'products.brand.assign', displayName: 'Assign product brands',
    description: 'Manage product-to-brand assignments.', domain: 'Products', module: 'products', sortOrder: 30,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'products.category.assign', displayName: 'Assign product categories',
    description: 'Manage product-to-category assignments.', domain: 'Products', module: 'products', sortOrder: 40,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'media.library.manage', displayName: 'Manage media library',
    description: 'Browse, upload, edit, move, and delete media library assets.', domain: 'Media', module: 'media-library', sortOrder: 10,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'orders.view', displayName: 'View orders',
    description: 'View stored fulfillment orders.', domain: 'Orders', module: 'orders', sortOrder: 10,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'orders.fulfillment.manage', displayName: 'Manage fulfillment',
    description: 'Recover, retry, and import fulfillment orders.', domain: 'Orders', module: 'orders', sortOrder: 20,
    defaultGroups: PLATFORM_OPERATIONS,
  },
  {
    key: 'bots.twitch.manage', displayName: 'Manage Twitch bot commands',
    description: 'Create, edit, and delete Twitch bot commands.', domain: 'Bots', module: 'twitch', sortOrder: 10,
    defaultGroups: ['SuperAdmin', 'Admin', 'Staff', 'StreamingPartner'],
  },
  {
    key: 'profiles.own.manage', displayName: 'Manage own profile',
    description: 'Create and update the signed-in user profile.', domain: 'Profiles', module: 'profiles', sortOrder: 10,
    defaultGroups: ALL_MEMBERS,
  },
  {
    key: 'profiles.staff.view', displayName: 'View user profiles',
    description: 'View user profiles for current staff administration workflows.', domain: 'Profiles', module: 'profiles', sortOrder: 20,
    defaultGroups: PLATFORM_OPERATIONS,
  },
]

function isKnownGroup(groupName: string): groupName is CognitoGroup {
  return COGNITO_GROUPS.includes(groupName as CognitoGroup)
}

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

async function getDataClient() {
  return (await import('../shared/dataClient')).getDataClient()
}

async function runInBatches<T>(items: T[], operation: (item: T) => Promise<void>, batchSize = 25) {
  for (let index = 0; index < items.length; index += batchSize) {
    await Promise.all(items.slice(index, index + batchSize).map(operation))
  }
}

function definitionSummary(definition: any) {
  return {
    id: definition.id,
    key: definition.key,
    displayName: definition.displayName,
    description: definition.description || null,
    domain: definition.domain,
    module: definition.module,
    isActive: definition.isActive,
    platformEnforced: PLATFORM_CONTROL_PERMISSION_KEYS.includes(
      definition.key as (typeof PLATFORM_CONTROL_PERMISSION_KEYS)[number],
    ),
    sortOrder: definition.sortOrder,
  }
}

function assignmentSummary(assignment: any) {
  return {
    id: assignment.id,
    groupName: assignment.groupName,
    permissionKey: assignment.permissionKey,
    enabled: assignment.enabled,
    assignedBy: assignment.assignedBy || null,
    changedBy: assignment.changedBy || null,
  }
}

function requiresPermissionCatalogBootstrap(definitions: any[], assignments: any[]) {
  const definitionKeys = new Set(definitions.map((definition) => definition.key))
  const assignmentKeys = new Set(assignments.map((assignment) => `${assignment.groupName}:${assignment.permissionKey}`))

  return INITIAL_PERMISSION_CATALOG.some((definition) => (
    !definitionKeys.has(definition.key)
    || definition.defaultGroups.some((groupName) => !assignmentKeys.has(`${groupName}:${definition.key}`))
  ))
}

export async function ensurePermissionCatalog(actorUserId: string) {
  const client = await getDataClient()
  return ensurePermissionCatalogWithClient(client, actorUserId)
}

export async function ensurePermissionCatalogWithClient(client: any, actorUserId: string) {
  const [existingDefinitions, existingAssignments] = await Promise.all([
    listAll(client, 'PermissionDefinition'),
    listAll(client, 'GroupPermission'),
  ])
  const existingByKey = new Map(existingDefinitions.map((definition) => [definition.key, definition]))
  const assignmentKeys = new Set(existingAssignments.map((assignment) => `${assignment.groupName}:${assignment.permissionKey}`))
  const missingDefinitions = INITIAL_PERMISSION_CATALOG.filter((definition) => !existingByKey.has(definition.key))
  const missingAssignments = INITIAL_PERMISSION_CATALOG.flatMap((definition) => definition.defaultGroups
    .filter((groupName) => !assignmentKeys.has(`${groupName}:${definition.key}`))
    .map((groupName) => ({ groupName, permissionKey: definition.key })))

  await runInBatches(missingDefinitions, async (definition) => {
    const { defaultGroups, ...definitionFields } = definition
    const result = await client.models.PermissionDefinition.create({
      id: `permission-definition:${definition.key}`,
      ...definitionFields,
      isActive: true,
      createdBy: actorUserId,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to seed ${definition.key}`)
  })

  await runInBatches(missingAssignments, async ({ groupName, permissionKey }) => {
    const key = `${groupName}:${permissionKey}`
    const result = await client.models.GroupPermission.create({
      id: `group-permission:${key}`,
      groupName,
      permissionKey,
      enabled: true,
      assignedBy: actorUserId,
      changedBy: actorUserId,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to seed ${key}`)
  })

  const createdDefinitions = missingDefinitions.length
  const createdAssignments = missingAssignments.length

  if (createdDefinitions || createdAssignments) {
    await writePermissionAudit(
      client,
      actorUserId,
      'permission.catalog.seed',
      'PermissionCatalog',
      'initial',
      null,
      { createdDefinitions, createdAssignments },
    )
  }

  return { createdDefinitions, createdAssignments }
}

/**
 * The backend authority for configurable global capabilities.  Resolver groups
 * come exclusively from the authenticated Cognito identity; assignments are
 * additive and an absent assignment is a denial.
 */
export async function getEffectivePermissionKeys(client: any, identity: any) {
  const [definitions, assignments] = await Promise.all([
    listAll(client, 'PermissionDefinition'),
    listAll(client, 'GroupPermission'),
  ])
  return resolveEffectivePermissionKeys(identity, definitions, assignments, PLATFORM_CONTROL_PERMISSION_KEYS)
}

export async function assertEffectivePermission(client: any, identity: any, permissionKey: string) {
  if (!(await getEffectivePermissionKeys(client, identity)).has(permissionKey)) {
    throw new Error(`Global permission is required: ${permissionKey}`)
  }
}

function assertPlatformAdminEvent(event: any) {
  const identity = getResolverIdentity(event)
  assertPlatformAdmin(identity)
  const actorUserId = getIdentityUsername(identity)
  if (!actorUserId) throw new Error('Authenticated user identity is required')
  return actorUserId
}

export async function handleListPermissionCatalog(event: any) {
  const client = await getDataClient()
  return handleListPermissionCatalogWithClient(event, client)
}

export async function handleListPermissionCatalogWithClient(event: any, client: any) {
  assertPlatformAdminEvent(event)
  const [definitions, assignments] = await Promise.all([
    listAll(client, 'PermissionDefinition'),
    listAll(client, 'GroupPermission'),
  ])

  return {
    requiresBootstrap: requiresPermissionCatalogBootstrap(definitions, assignments),
    definitions: definitions
      .sort((a, b) => a.domain.localeCompare(b.domain) || a.sortOrder - b.sortOrder || a.key.localeCompare(b.key))
      .map(definitionSummary),
    assignments: assignments
      .sort((a, b) => a.groupName.localeCompare(b.groupName) || a.permissionKey.localeCompare(b.permissionKey))
      .map(assignmentSummary),
  }
}

export async function handleSeedPermissionCatalog(event: any) {
  const actorUserId = assertPlatformAdminEvent(event)
  const result = await ensurePermissionCatalog(actorUserId)
  return {
    success: true,
    message: 'Permission catalog is ready',
    changedCount: result.createdDefinitions + result.createdAssignments,
  }
}

export async function handleReplaceGroupPermissions(event: any) {
  const actorUserId = assertPlatformAdminEvent(event)
  await ensurePermissionCatalog(actorUserId)
  const { groupName, permissionKeys } = event.arguments || {}

  if (typeof groupName !== 'string' || !isKnownGroup(groupName)) {
    throw new Error('Unknown Cognito group')
  }

  if (!Array.isArray(permissionKeys) || permissionKeys.some((key) => typeof key !== 'string')) {
    throw new Error('permissionKeys must be an array of strings')
  }

  const requestedKeys = [...new Set(permissionKeys)]
  const client = await getDataClient()
  const definitions = await listAll(client, 'PermissionDefinition')
  const activeKeys = new Set(definitions.filter((definition) => definition.isActive).map((definition) => definition.key))
  const invalidKey = requestedKeys.find((key) => !activeKeys.has(key))
  if (invalidKey) throw new Error(`Unknown or inactive permission key: ${invalidKey}`)

  assertPlatformControlAssignments(groupName, requestedKeys, PLATFORM_ADMINS, [...PLATFORM_CONTROL_PERMISSION_KEYS].filter((key) => activeKeys.has(key)))

  const allAssignments = await listAll(client, 'GroupPermission')
  const groupAssignments = allAssignments.filter((assignment) => assignment.groupName === groupName)
  const assignmentsByKey = new Map(groupAssignments.map((assignment) => [assignment.permissionKey, assignment]))
  const before = groupAssignments.map(assignmentSummary)
  let changedCount = 0

  for (const permissionKey of activeKeys) {
    const shouldEnable = requestedKeys.includes(permissionKey)
    const existing = assignmentsByKey.get(permissionKey)

    if (!existing) {
      if (!shouldEnable) continue
      const result = await client.models.GroupPermission.create({
        id: `group-permission:${groupName}:${permissionKey}`,
        groupName,
        permissionKey,
        enabled: true,
        assignedBy: actorUserId,
        changedBy: actorUserId,
      })
      if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to create group permission')
      changedCount += 1
      continue
    }

    if (existing.enabled === shouldEnable) continue
    const result = await client.models.GroupPermission.update({
      id: existing.id,
      enabled: shouldEnable,
      changedBy: actorUserId,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to update group permission')
    changedCount += 1
  }

  if (changedCount) {
    const afterAssignments = await listAll(client, 'GroupPermission')
    await writePermissionAudit(
      client,
      actorUserId,
      'permission.group.replace',
      'CognitoGroup',
      groupName,
      before,
      afterAssignments.filter((assignment) => assignment.groupName === groupName).map(assignmentSummary),
    )
  }

  return {
    success: true,
    message: changedCount ? 'Group permissions updated' : 'No permission changes were required',
    changedCount,
  }
}

export async function handleGetMyAccessContext(event: any) {
  const client = await getDataClient()
  return handleGetMyAccessContextWithClient(event, client)
}

export async function handleGetMyAccessContextWithClient(event: any, client: any) {
  const identity = getResolverIdentity(event)
  const userId = getIdentityUsername(identity)

  if (!userId) {
    throw new Error('Authenticated user identity is required')
  }

  const groups = [...new Set(getIdentityGroups(identity))]
  const [permissions, brands] = await Promise.all([
    getEffectivePermissionKeys(client, identity),
    getAccessibleBrandSummaries(client, userId, groups.some((group) => ['SuperAdmin', 'Admin', 'Staff'].includes(group))),
  ])
  const platformAdmin = isPlatformAdmin(identity)

  return {
    userId,
    groups: groups.sort(),
    permissions: [...permissions].sort(),
    isPlatformAdmin: platformAdmin,
    brands,
  }
}
