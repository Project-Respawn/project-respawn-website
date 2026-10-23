import assert from 'node:assert/strict'
import test from 'node:test'
import { advertisedVariantPrice, advertisedCataloguePrice } from './currencyPrices.js'
import { checkoutCurrencies, priceDraft, pricesFromDraft } from './currencyPrices.js'

test('administrator configures independent currencies without exchange conversion', () => {
  assert.deepEqual(checkoutCurrencies, ['GBP', 'EUR', 'USD'])
  assert.deepEqual(pricesFromDraft({ GBP: '10.00', EUR: '17.95', USD: '8.01' }), { GBP: 1000, EUR: 1795, USD: 801 })
  assert.deepEqual(priceDraft('{"GBP":1000,"USD":801}'), { GBP: '10.00', EUR: '', USD: '8.01' })
  assert.deepEqual(pricesFromDraft({ GBP: '', EUR: '1.00', USD: '' }), { EUR: 100 })
})
test('invalid precision, negative, zero, exponent and excessive prices are rejected', () => {
  for (const GBP of ['0', '-1', '1.001', '1e3', '10000.01', 'invalid']) assert.throws(() => pricesFromDraft({ GBP }))
})
test('catalogue uses configured inclusive prices and never supplier fallbacks or exchange rates',()=>{
  assert.equal(advertisedVariantPrice({GBP:2500,EUR:1000}).minor,2500)
  assert.equal(advertisedVariantPrice({USD:3200}).currency,'USD')
  assert.equal(advertisedVariantPrice('{bad'),null)
  assert.equal(advertisedVariantPrice({GBP:-1}),null)
  assert.match(advertisedCataloguePrice([{currencyPrices:{EUR:2900}},{currencyPrices:{GBP:2500}}]),/25\.00.*tax inclusive/)
  assert.equal(advertisedCataloguePrice([]),'Price available after configuration')
})
