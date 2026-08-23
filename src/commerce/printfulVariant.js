export function printfulSyncVariantId(variant) {
  return String(variant?.fulfillmentVariantId ?? variant?.id ?? '').trim()
}

export function printfulVariantSelectionKey(variant) {
  const color = String(variant?.color ?? variant?.colour ?? '').trim().toLowerCase()
  const size = String(variant?.size ?? '').trim().toUpperCase()
  return `${color}|${size}`
}

export function findExistingPrintfulVariant(variants, incoming) {
  const syncId = printfulSyncVariantId(incoming)
  const bySyncId = (variants || []).find((variant) => String(variant?.externalVariantId || '').trim() === syncId)
  if (bySyncId) return bySyncId
  const selectionKey = printfulVariantSelectionKey(incoming)
  return (variants || []).find((variant) => printfulVariantSelectionKey(variant) === selectionKey) || null
}
