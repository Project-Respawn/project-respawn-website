import { generateClient } from 'aws-amplify/data'

let client
function getClient() { return client ||= generateClient() }

function providerSummary(statuses = {}) {
  const values = Object.values(statuses || {})
  if (!values.length) return 'recovery_required'
  if (values.every((status) => status?.status === 'fulfilled')) return 'fulfilled'
  if (values.some((status) => status?.status === 'failed')) return 'failed'
  if (values.some((status) => status?.status === 'fulfilled')) return 'partially_fulfilled'
  return 'pending'
}

function fulfillmentSummary(order) {
  const recovered = (order.auditHistory || []).some((entry) => entry?.action === 'Admin recovery started' && entry?.result === 'verified')
  return recovered && order.overallFulfillmentStatus === 'fulfilled'
    ? 'recovered'
    : order.overallFulfillmentStatus || providerSummary(order.providerStatuses)
}

export default {
  name: 'AdminOrders',
  data() {
    return { orders: [], selectedOrder: null, loading: true, actionLoading: false, error: '', message: '', search: '', paymentFilter: '', fulfillmentFilter: '', legacyRevolutOrderId: '' }
  },
  computed: {
    filteredOrders() {
      const query = this.search.trim().toLowerCase()
      return this.orders.filter((order) => {
        const fulfillment = fulfillmentSummary(order)
        const matchesQuery = !query || [order.projectOrderId, order.revolutOrderId, order.email, order.customerName].some((value) => String(value || '').toLowerCase().includes(query))
        return matchesQuery && (!this.paymentFilter || order.paymentStatus === this.paymentFilter) && (!this.fulfillmentFilter || fulfillment === this.fulfillmentFilter)
      })
    },
  },
  async mounted() { await this.loadOrders() },
  methods: {
    providerSummary,
    fulfillmentSummary,
    formatDate(value) { return value ? new Date(value).toLocaleString() : '—' },
    async loadOrders() {
      this.loading = true; this.error = ''
      try {
        const result = await getClient().queries.listManagedOrders()
        if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load orders')
        const orders = result.data?.orders || []
        this.orders = orders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
        if (this.selectedOrder) this.selectedOrder = this.orders.find((order) => order.id === this.selectedOrder.id) || null
      } catch (error) { this.error = error?.message || 'Failed to load orders' } finally { this.loading = false }
    },
    selectOrder(order) { this.selectedOrder = order; this.message = ''; this.error = '' },
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
