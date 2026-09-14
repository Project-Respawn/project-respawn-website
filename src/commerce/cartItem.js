export function assertCartItemsFulfillable(items) {
  for (const item of items || []) {
    if (String(item?.fulfillmentProvider || '').toLowerCase() !== 'printful') continue
    if (!String(item?.fulfillmentVariantId || '').trim()) {
      throw new Error('A Printful item is missing its fulfilment mapping. Remove it from the cart and select it again.')
    }
  }
  return items
}

export function normaliseCartItem(item, index) {
  const title = item?.name ?? item?.title ?? item?.productTitle ?? item?.product_name

  return {
    id: item?.id ?? item?.productId ?? `item-${index}`,
    name: title || 'Product',
    variant: item?.variant ?? item?.variantName ?? item?.size ?? '',
    color: item?.color ?? '',
    size: item?.size ?? '',
    price: Number(item?.price ?? item?.unitPrice ?? 0),
    quantity: Number(item?.quantity ?? item?.qty ?? 1),
    image: item?.image ?? item?.thumbnailUrl ?? '',
    variantId: item?.variantId ?? '',
    externalVariantId: item?.externalVariantId ?? item?.fulfillmentVariantId ?? '',
    fulfillmentProvider: item?.fulfillmentProvider ?? '',
    fulfillmentVariantId: item?.fulfillmentVariantId ?? '',
    productId: item?.productId ?? item?.id ?? `item-${index}`,
  }
}

export function buildMerchCartItem({ product, variant, quantity, price, image, selectedColor, selectedSize, fallbackImage }) {
  const isPrintful = String(product?.sourceType || '').trim().toLowerCase() === 'printful'
  const fulfillmentVariantId = variant?.fulfillmentVariantId || variant?.externalVariantId || ''
  if (isPrintful && !String(fulfillmentVariantId).trim()) {
    throw new Error('This Printful variant is not configured for fulfilment')
  }
  return {
    id: product.id,
    productId: product.id,
    name: product.title,
    title: product.title,
    image: image || product.image || fallbackImage,
    price: Number(price),
    productUrl: product.productUrl || '',
    quantity,
    variantId: variant?.id || '',
    externalVariantId: fulfillmentVariantId,
    fulfillmentProvider: isPrintful ? 'printful' : 'manual',
    fulfillmentVariantId: isPrintful ? fulfillmentVariantId : '',
    variant: variant?.name || selectedSize || '',
    variantName: variant?.name || '',
    color: variant?.color || selectedColor || '',
    size: variant?.size || selectedSize || '',
    availabilityStatus: variant?.availabilityStatus || '',
  }
}

export function isSameCartVariant(left, right) {
  return String(left?.productId || left?.id) === String(right?.productId || right?.id)
    && String(left?.variantId || '') === String(right?.variantId || '')
    && String(left?.color || '') === String(right?.color || '')
    && String(left?.size || '') === String(right?.size || '')
}
