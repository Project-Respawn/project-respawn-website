import { CommerceError, Providers, Recipient } from './contracts'

// Configuration is reviewed backend source, never a request or browser preference.
// Rates and territorial/product scope must be supplied by the seller's tax adviser.
export type TaxPolicyConfig = {
  seller: 'Ravens Community'; version: string; approvalReference: string
  validFrom: number; validUntil: number
  rules: { country: string; currencies: string[]; productIds: string[]; rateBasisPoints: number
    postcodePrefixes: string[]; excludedPostcodePrefixes: string[]; reference: string }[]
}
export const TAX_POLICY: TaxPolicyConfig = {
  seller: 'Ravens Community', version: 'UNCONFIGURED', approvalReference: '', validFrom: 0, validUntil: 0, rules: [],
}
export function inclusiveTaxPolicy(config: TaxPolicyConfig, now = Date.now) {
  function configured() {
    if (config.seller !== 'Ravens Community' || !config.approvalReference || !config.version || config.version === 'UNCONFIGURED' ||
      !Number.isSafeInteger(config.validFrom) || !Number.isSafeInteger(config.validUntil) || config.validFrom > now() || config.validUntil <= now()) {
      throw new CommerceError('CUSTOMER_TAX_POLICY_UNCONFIGURED', 503)
    }
  }
  function candidates(recipient: Recipient) {
    configured()
    const postcode = recipient.zip.toUpperCase().replace(/\s/g, '')
    return config.rules.filter(r => r.country === recipient.country_code && r.reference &&
      Number.isSafeInteger(r.rateBasisPoints) && r.rateBasisPoints >= 0 && r.rateBasisPoints <= 10000 &&
      r.productIds.length > 0 && r.currencies.length > 0 && r.postcodePrefixes.length > 0 &&
      r.postcodePrefixes.some(prefix => prefix.length > 0 && postcode.startsWith(prefix.toUpperCase().replace(/\s/g, ''))) &&
      !r.excludedPostcodePrefixes.some(prefix => postcode.startsWith(prefix.toUpperCase().replace(/\s/g, ''))))
  }
  return {
    async destination(recipient: Recipient) {
      if (!candidates(recipient).length) throw new CommerceError('DESTINATION_UNSUPPORTED', 400)
    },
    tax: (async (basis, basisHash) => {
      if (basis.shippingMinor !== 0) throw new CommerceError('INVALID_CUSTOMER_SHIPPING', 503)
      const rules = candidates(basis.recipient).filter(r => r.currencies.includes(basis.currency) &&
        basis.lines.every(line => r.productIds.includes(line.productId)))
      // Ambiguous or mixed-product treatment needs a separately reviewed policy.
      if (rules.length !== 1) throw new CommerceError('TAX_TREATMENT_UNSUPPORTED', 400)
      const rule = rules[0]
      const numerator = BigInt(basis.subtotalMinor) * BigInt(rule.rateBasisPoints)
      const denominator = BigInt(10000 + rule.rateBasisPoints)
      const amountMinor = Number((numerator + denominator / 2n) / denominator)
      return { currency: basis.currency, amountMinor, inclusive: true, basisHash,
        reference: `${config.approvalReference}:${rule.reference}`, policy: config.version }
    }) satisfies Providers['tax'],
  }
}
