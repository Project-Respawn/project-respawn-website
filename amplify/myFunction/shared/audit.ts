/** Write security-significant management changes with a trusted resolver actor. */
function asAuditJson(value: unknown) {
  if (value === undefined) return null
  const serialized = JSON.stringify(value)
  return serialized === undefined ? null : serialized
}

export async function writePermissionAudit(
  client: any,
  actorUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  before: unknown,
  after: unknown,
) {
  const result = await client.models.PermissionAuditEvent.create({
    actorUserId,
    action,
    targetType,
    targetId,
    before: asAuditJson(before),
    after: asAuditJson(after),
    occurredAt: new Date().toISOString(),
  })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to write permission audit event')
}
