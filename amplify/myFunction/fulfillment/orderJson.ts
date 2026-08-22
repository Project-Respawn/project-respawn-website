export function parseOrderJson<T>(value: unknown, fallback: T): T {
  let parsed: unknown = value
  for (let attempt = 0; attempt < 2 && typeof parsed === 'string'; attempt += 1) {
    try { parsed = JSON.parse(parsed) } catch { return fallback }
  }
  return (parsed ?? fallback) as T
}

export function decodeFulfillmentOrder(order: any) {
  if (!order) return order
  return {
    ...order,
    shippingAddress: parseOrderJson(order.shippingAddress, {}),
    items: parseOrderJson(order.items, []),
    providerStatuses: parseOrderJson(order.providerStatuses, {}),
    auditHistory: parseOrderJson(order.auditHistory, []),
  }
}
