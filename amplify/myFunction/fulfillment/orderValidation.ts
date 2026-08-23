const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

function requiredText(value: unknown, field: string) {
  const normalized = String(value || '').trim()
  if (!normalized) throw new Error(`FulfillmentOrder ${field} is required`)
  return normalized
}

function requiredDate(value: unknown, field: string) {
  const normalized = requiredText(value, field)
  if (!ISO_DATE.test(normalized) || Number.isNaN(Date.parse(normalized))) {
    throw new Error(`FulfillmentOrder ${field} must be a valid ISO timestamp`)
  }
  return normalized
}

export function validateFulfillmentOrder(order: any) {
  requiredText(order?.revolutOrderId, 'revolutOrderId')
  requiredText(order?.projectOrderId, 'projectOrderId')
  const environment = requiredText(order?.environment, 'environment').toLowerCase()
  if (!['sandbox', 'production'].includes(environment)) {
    throw new Error('FulfillmentOrder environment must be sandbox or production')
  }
  requiredDate(order?.createdAt, 'createdAt')
  requiredDate(order?.updatedAt, 'updatedAt')
  return order
}

export async function createValidatedFulfillmentOrder(client: any, input: any) {
  validateFulfillmentOrder(input)
  const result = await client.models.FulfillmentOrder.create(input)
  if (!result?.data) {
    const details = Array.isArray(result?.errors)
      ? result.errors.map((error: any) => error?.message).filter(Boolean).join('; ')
      : ''
    throw new Error(details ? `FulfillmentOrder could not be persisted: ${details}` : 'FulfillmentOrder could not be persisted')
  }
  return result.data
}

export function isProvablyMalformedFulfillmentOrder(order: any) {
  const meaningfulJson = (value: unknown) => {
    if (Array.isArray(value)) return value.length > 0
    if (value && typeof value === 'object') return Object.keys(value).length > 0
    if (typeof value !== 'string' || !value.trim()) return false
    try { return meaningfulJson(JSON.parse(value)) } catch { return true }
  }
  return !String(order?.revolutOrderId || '').trim()
    && !String(order?.projectOrderId || '').trim()
    && !String(order?.paymentStatus || '').trim()
    && !String(order?.customerName || '').trim()
    && !String(order?.email || '').trim()
    && !meaningfulJson(order?.shippingAddress)
    && !meaningfulJson(order?.items)
    && !meaningfulJson(order?.providerStatuses)
    && !meaningfulJson(order?.auditHistory)
}
