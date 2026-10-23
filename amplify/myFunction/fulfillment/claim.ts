import { randomUUID } from 'node:crypto'
import { decodeFulfillmentOrder } from './orderJson'

// Explicit GraphQL mutation: the model convenience update must not silently drop condition.
export const CLAIM_MUTATION = 'mutation AtomicFulfillment($input: UpdateFulfillmentOrderInput!, $condition: ModelFulfillmentOrderConditionInput!) { updateFulfillmentOrder(input: $input, condition: $condition) { id projectOrderId revolutOrderId paymentStatus paymentDate paymentAmount currency environment overallFulfillmentStatus customerName email phone shippingAddress items providerStatuses reconciliationError auditHistory createdAt updatedAt } }'
export type Claim = { attemptId: string; token: string; order: any; statuses: any }
const uuidStatus = (id: unknown) => (typeof id === 'string' && id.trim() !== '') || (typeof id === 'number' && Number.isSafeInteger(id) && id > 0)
export function providerId(response: any): string {
  const id = response?.body?.result?.id
  if (!Number.isInteger(response?.statusCode) || response.statusCode < 200 || response.statusCode >= 300 || !uuidStatus(id)) {
    throw new Error('Provider response is incomplete or failed; reconcile before retry')
  }
  return String(id)
}
export function inspectStoredAttempt(order: any): 'fresh' | 'fulfilled' | 'test_skipped' {
  const state = String(order.overallFulfillmentStatus || '')
  if (state.startsWith('fulfillment_claimed:') || state.startsWith('reconciliation_required:')) {
    throw new Error('Persistent fulfilment claim requires reconciliation; reconcile before retry')
  }
  const statuses = order.providerStatuses || {}, prior = statuses.printful
  if (Object.keys(statuses).some(k => k !== 'printful')) throw new Error('Legacy provider history requires reconciliation')
  if (prior?.status === 'fulfilled') {
    if (!uuidStatus(prior.providerOrderId)) throw new Error('Fulfilled record has no provider ID; reconcile before retry')
    return 'fulfilled'
  }
  if (prior?.status === 'test_skipped' && order.environment === 'sandbox') return 'test_skipped'
  if (prior && (prior.attemptId || prior.lastAttempt || prior.providerOrderId || prior.status !== 'pending')) {
    throw new Error('Previous provider attempt requires reconciliation; reconcile before retry')
  }
  if (state && !['pending', 'recovery_required'].includes(state)) throw new Error('Legacy fulfilment status requires reconciliation')
  return 'fresh'
}
function sameScalar(key: string, value: any) {
  if (value === undefined || value === null) return { or: [{ [key]: { attributeExists: false } }, { [key]: { attributeType: '_null' } }] }
  return { [key]: { eq: value } }
}
async function conditionalUpdate(client: any, input: any, condition: any) {
  if (typeof client.graphql !== 'function') throw new Error('Conditional GraphQL transport unavailable; fulfilment held')
  let response: any
  try { response = await client.graphql({ query: CLAIM_MUTATION, variables: { input, condition }, authMode: 'iam' }) }
  catch { throw new Error('Conditional write rejected or uncertain; reconcile before retry') }
  if (response?.errors?.length || !response?.data?.updateFulfillmentOrder) {
    throw new Error('Conditional write rejected or uncertain; reconcile before retry')
  }
  return decodeFulfillmentOrder(response.data.updateFulfillmentOrder)
}
export async function acquireFulfillmentClaim(client: any, order: any): Promise<Claim> {
  if (inspectStoredAttempt(order) !== 'fresh') throw new Error('Order is not claimable')
  const attemptId = randomUUID(), token = 'fulfillment_claimed:' + attemptId, now = new Date().toISOString()
  const statuses = { ...(order.providerStatuses || {}), printful: { status: 'pending', attemptId, claimState: 'claimed', lastAttempt: now } }
  const auditHistory = [...(order.auditHistory || []), { timestamp: now, action: 'Atomic fulfilment claim', result: 'claimed', provider: 'printful', attemptId }]
  const claimed = await conditionalUpdate(client, { id: order.id, overallFulfillmentStatus: token, providerStatuses: JSON.stringify(statuses), auditHistory: JSON.stringify(auditHistory), updatedAt: now },
    { and: [{ id: { eq: order.id } }, sameScalar('overallFulfillmentStatus', order.overallFulfillmentStatus), sameScalar('updatedAt', order.updatedAt)] })
  if (claimed.id !== order.id || claimed.overallFulfillmentStatus !== token || claimed.providerStatuses?.printful?.attemptId !== attemptId) {
    throw new Error('Claim ownership response is uncertain; reconcile before retry')
  }
  return { attemptId, token, order: claimed, statuses: claimed.providerStatuses }
}
export function claimedSnapshotClient(client: any, claim: Claim) {
  // The conditional mutation response is the just-written record, not an eventually consistent get.
  return { ...client, models: { ...client.models, FulfillmentOrder: { ...client.models.FulfillmentOrder, get: async () => ({ data: claim.order }) } } }
}
export async function completeFulfillmentClaim(client: any, claim: Claim, id: string) {
  const statuses = { ...claim.statuses, printful: { ...claim.statuses.printful, status: 'fulfilled', providerOrderId: id, claimState: 'fulfilled' } }
  const done = await conditionalUpdate(client, { id: claim.order.id, overallFulfillmentStatus: 'fulfilled', providerStatuses: JSON.stringify(statuses), reconciliationError: null }, { overallFulfillmentStatus: { eq: claim.token } })
  if (done.overallFulfillmentStatus !== 'fulfilled' || done.providerStatuses?.printful?.attemptId !== claim.attemptId) throw new Error('Completion response uncertain; reconcile before retry')
  return done.providerStatuses
}
export async function holdFulfillmentClaim(client: any, claim: Claim) {
  const statuses = { ...claim.statuses, printful: { ...claim.statuses.printful, status: 'failed', claimState: 'reconciliation_required', lastError: 'Authoritative provider reconciliation required' } }
  // Never release a claim, never steal another attempt, and never overwrite a completed record.
  await conditionalUpdate(client, { id: claim.order.id, overallFulfillmentStatus: 'reconciliation_required:' + claim.attemptId, providerStatuses: JSON.stringify(statuses), reconciliationError: 'Fulfilment outcome requires authoritative provider reconciliation' }, { overallFulfillmentStatus: { eq: claim.token } })
}
