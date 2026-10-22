import { REVOLUT_MODE } from '../config/env'
import { decodeFulfillmentOrder } from './orderJson'

/** Legacy orders have no trusted quote marker. Revalidate conservatively against
 * current catalogue data; changed/missing prices require manual reconciliation.
 * Stage 1 supports only GBP Printful merchandise with no extra shipping/tax lines.
 */
export async function assertStoredOrderSafe(input: any, client: any, fetchPayment: (id: string) => Promise<any>) {
  if (!input?.id) throw new Error('Stored internal order ID is required')
  const result = await client.models.FulfillmentOrder.get({ id: input.id })
  if (result?.errors?.length || !result?.data) throw new Error('Stored order not found')
  const order = decodeFulfillmentOrder(result.data)
  const environment = REVOLUT_MODE === 'prod' ? 'production' : 'sandbox'
  if (order.environment !== environment) throw new Error('Stored order environment mismatch')
  if (!order.projectOrderId || !order.revolutOrderId || order.currency !== 'GBP' ||
      !Number.isFinite(order.paymentAmount) || order.paymentAmount <= 0 ||
      !Array.isArray(order.items) || !order.items.length || order.items.length > 100) {
    throw new Error('Stored order requires commercial reconciliation')
  }
  // Detect existing duplicate legacy records before taking a per-record claim.
  // This read is conservative reconciliation, not a global uniqueness lock.
  if (typeof client.models.FulfillmentOrder.list !== 'function') throw new Error('Legacy uniqueness cannot be verified; reconcile before retry')
  const related = await client.models.FulfillmentOrder.list({ filter: { or: [
    { projectOrderId: { eq: order.projectOrderId } }, { revolutOrderId: { eq: order.revolutOrderId } },
  ] }, limit: 1000 })
  if (related?.errors?.length || related?.nextToken || !Array.isArray(related?.data) ||
      !related.data.some((record: any) => record?.id === order.id) || related.data.some((record: any) => record?.id !== order.id)) {
    throw new Error('Duplicate or uncertain legacy records require reconciliation; reconcile before retry')
  }
  let total = 0
  for (const item of order.items) {
    if (item.fulfillmentProvider !== 'printful' || !item.variantId || !item.productId ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new Error('Stored merchandise requires reconciliation')
    }
    const [vr, pr] = await Promise.all([
      client.models.MerchProductVariant.get({ id: item.variantId }),
      client.models.MerchProduct.get({ id: item.productId }),
    ])
    const variant = vr?.data, product = pr?.data
    if (vr?.errors?.length || pr?.errors?.length || !variant || !product || product.sourceType !== 'printful' ||
        variant.productId !== item.productId || !variant.externalVariantId ||
        variant.externalVariantId !== item.fulfillmentVariantId ||
        variant.currency !== 'GBP' || !Number.isFinite(variant.retailPrice) || variant.retailPrice <= 0 ||
        item.unitPrice !== variant.retailPrice) {
      throw new Error('Stored price or variant mapping requires reconciliation')
    }
    const minor = Math.round(variant.retailPrice * 100)
    if (Math.abs(variant.retailPrice * 100 - minor) > 0.000001) throw new Error('Invalid catalogue price precision')
    total += minor * item.quantity
  }
  if (!Number.isSafeInteger(total) || total !== Math.round(order.paymentAmount * 100)) {
    throw new Error('Stored order total does not match catalogue pricing')
  }
  const payment = await fetchPayment(order.revolutOrderId)
  const paid = payment?.body
  if (!Number.isInteger(payment?.statusCode) || payment.statusCode < 200 || payment.statusCode >= 300 || !paid ||
      paid.id !== order.revolutOrderId || paid.merchant_order_ext_ref !== order.projectOrderId ||
      paid.state !== 'completed' || paid.currency !== order.currency || paid.amount !== total ||
      (paid.refunded_amount !== undefined && paid.refunded_amount !== 0)) {
    throw new Error('Authoritative captured payment does not match stored order')
  }
  return order
}
