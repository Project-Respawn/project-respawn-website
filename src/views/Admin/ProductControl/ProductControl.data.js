function valueType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

export function decodeProductControlArray(value, fieldName) {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return []
    let decoded
    try {
      decoded = JSON.parse(text)
    } catch {
      throw new Error(`Product Control received malformed JSON for ${fieldName}.`)
    }
    if (!Array.isArray(decoded)) {
      throw new Error(`Product Control expected ${fieldName} to decode to an array, received ${valueType(decoded)}.`)
    }
    return decoded
  }
  throw new Error(`Product Control expected ${fieldName} to be an array, received ${valueType(value)}.`)
}

export function normalizeProductControlRecords(value, fieldName) {
  return decodeProductControlArray(value, fieldName).map((record, index) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error(`Product Control received an invalid ${fieldName} entry at index ${index}.`)
    }
    return { ...record }
  })
}

export function decodeManagedMediaLibrary(value) {
  const library = value == null ? {} : value
  if (typeof library !== 'object' || Array.isArray(library)) {
    throw new Error(`Product Control expected the managed media response to be an object, received ${valueType(library)}.`)
  }
  return {
    mediaItems: normalizeProductControlRecords(library.mediaItems, 'managed media items'),
    collections: normalizeProductControlRecords(library.collections, 'managed media collections'),
  }
}

export function normalizeProductControlProduct(product, variants = []) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    throw new Error('Product Control received an invalid product record.')
  }
  const normalized = {
    ...product,
    variants: normalizeProductControlRecords(variants, `variants for product ${product.id || 'unknown'}`),
  }
  for (const fieldName of ['colors', 'colours', 'sizes', 'images']) {
    if (Object.prototype.hasOwnProperty.call(product, fieldName)) {
      normalized[fieldName] = decodeProductControlArray(product[fieldName], `${fieldName} for product ${product.id || 'unknown'}`)
    }
  }
  return normalized
}
