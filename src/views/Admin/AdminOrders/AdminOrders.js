import { generateClient } from 'aws-amplify/data'

let client
function getClient() { return client ||= generateClient() }

export function providerSummary(statuses = {}) {
  const values = Object.values(statuses || {})
  if (!values.length) return 'recovery_required'
  if (values.every((status) => status?.status === 'fulfilled')) return 'fulfilled'
  if (values.some((status) => status?.status === 'failed')) return 'failed'
  if (values.some((status) => status?.status === 'fulfilled')) return 'partially_fulfilled'
  return 'pending'
}

export function fulfillmentSummary(order) {
  const recovered = (order.auditHistory || []).some((entry) => entry?.action === 'Admin recovery started' && entry?.result === 'verified')
  return recovered && order.overallFulfillmentStatus === 'fulfilled'
    ? 'recovered'
    : order.overallFulfillmentStatus || providerSummary(order.providerStatuses)
}

export function sortOrdersNewestFirst(orders = []) {
  return [...orders].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

export function orderMatchesFilters(order, { search = '', paymentFilter = '', fulfillmentFilter = '' } = {}) {
  const query = search.trim().toLowerCase()
  const fulfillment = fulfillmentSummary(order)
  const matchesQuery = !query || [order.projectOrderId, order.revolutOrderId, order.email, order.customerName]
    .some((value) => String(value || '').toLowerCase().includes(query))
  return matchesQuery && (!paymentFilter || order.paymentStatus === paymentFilter) && (!fulfillmentFilter || fulfillment === fulfillmentFilter)
}

export function isPaidStatus(status) {
  return ['paid', 'completed', 'captured'].includes(String(status || '').toLowerCase())
}

export function hasProviderError(order) {
  return Object.values(order?.providerStatuses || {}).some((status) => Boolean(status?.lastError))
}

export default {
  name: 'AdminOrders',
  data() {
    return { orders: [], selectedOrder: null, loading: true, actionLoading: false, error: '', message: '', search: '', paymentFilter: '', fulfillmentFilter: '', legacyRevolutOrderId: '' }
  },
  computed: {
    filteredOrders() {
      return this.orders.filter((order) => orderMatchesFilters(order, this))
    },
  },
  async mounted() { await this.loadOrders() },
  methods: {
    providerSummary,
    fulfillmentSummary,
    isPaidStatus,
    hasProviderError,
    formatDate(value) { return value ? new Date(value).toLocaleString() : '—' },
    async loadOrders() {
      this.loading = true; this.error = ''
      try {
        const result = await getClient().queries.listManagedOrders()
        if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load orders')
        const orders = result.data?.orders || []
        this.orders = sortOrdersNewestFirst(orders)
        if (this.selectedOrder) this.selectedOrder = this.orders.find((order) => order.id === this.selectedOrder.id) || null
      } catch (error) { this.error = error?.message || 'Failed to load orders' } finally { this.loading = false }
    },
    selectOrder(order) { this.selectedOrder = order; this.message = ''; this.error = '' },
    async reconcileOrder(order) {
      if (!order || this.actionLoading) return
      this.actionLoading = true; this.error = ''; this.message = ''
      try {
        const result = await getClient().mutations.reconcileManagedOrder({ orderId: order.id })
        if (result.errors?.length || !result.data?.success) throw new Error(result.errors?.[0]?.message || 'Payment reconciliation failed')
        this.message = result.data.message || 'Payment reconciliation completed.'
        await this.loadOrders()
      } catch (error) { this.error = error?.message || 'Payment reconciliation failed' } finally { this.actionLoading = false }
    },
    async recoverOrder(order) {
      if (!order || this.actionLoading) return
      this.actionLoading = true; this.error = ''; this.message = ''
      try {
        const result = await getClient().mutations.recoverManagedOrder({ orderId: order.id })
        if (result.errors?.length || !result.data?.success) throw new Error(result.errors?.[0]?.message || 'Fulfillment recovery failed')
        this.message = 'Fulfillment recovery completed.'
        await this.loadOrders()
      } catch (error) { this.error = error?.message || 'Fulfillment recovery failed' } finally { this.actionLoading = false }
    },
    async importExistingRevolutOrder() {
      if (!this.legacyRevolutOrderId.trim() || this.actionLoading) return
      this.actionLoading = true; this.error = ''; this.message = ''
      try {
        const result = await getClient().mutations.importManagedRevolutOrder({ revolutOrderId: this.legacyRevolutOrderId.trim() })
        if (result.errors?.length || !result.data?.success) throw new Error(result.errors?.[0]?.message || 'Existing Revolut order import failed')
        this.message = result.data.message || 'Existing Revolut order imported.'
        this.legacyRevolutOrderId = ''
        await this.loadOrders()
      } catch (error) { this.error = error?.message || 'Existing Revolut order import failed' } finally { this.actionLoading = false }
    },
  },
}
