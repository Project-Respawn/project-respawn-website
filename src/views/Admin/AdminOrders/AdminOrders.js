import { generateClient } from 'aws-amplify/data'
import { getApiBaseUrl, joinApiUrl } from '../../../config/apiBaseUrl'

let client
function getClient() { return client ||= generateClient() }

function providerSummary(statuses = {}) {
  if (statuses?.legacy?.status === 'pending') return 'recovery_required'
  const values = Object.values(statuses || {})
  if (!values.length) return 'recovery_required'
  if (values.every((status) => status?.status === 'fulfilled')) return 'fulfilled'
  if (values.some((status) => status?.status === 'failed')) return 'failed'
  if (values.some((status) => status?.status === 'fulfilled')) return 'partially_fulfilled'
  return 'pending'
}

export default {
  name: 'AdminOrders',
  data() {
    return { orders: [], selectedOrder: null, loading: true, actionLoading: false, error: '', message: '', search: '', paymentFilter: '', fulfillmentFilter: '', legacyRevolutOrderId: '', apiBase: getApiBaseUrl('order fulfillment recovery') }
  },
  computed: {
    filteredOrders() {
      const query = this.search.trim().toLowerCase()
      return this.orders.filter((order) => {
        const fulfillment = providerSummary(order.providerStatuses)
        const matchesQuery = !query || [order.projectOrderId, order.revolutOrderId, order.email, order.customerName].some((value) => String(value || '').toLowerCase().includes(query))
        return matchesQuery && (!this.paymentFilter || order.paymentStatus === this.paymentFilter) && (!this.fulfillmentFilter || fulfillment === this.fulfillmentFilter)
      })
    },
  },
  async mounted() { await this.loadOrders() },
  methods: {
    providerSummary,
    formatDate(value) { return value ? new Date(value).toLocaleString() : '—' },
    async loadOrders() {
      this.loading = true; this.error = ''
      try {
        const orders = []
        let nextToken = null
        do {
          const result = await getClient().models.FulfillmentOrder.list({ limit: 1000, nextToken: nextToken || undefined })
          if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load orders')
          orders.push(...(result.data || []))
          nextToken = result.nextToken || null
        } while (nextToken)
        this.orders = orders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
        if (this.selectedOrder) this.selectedOrder = this.orders.find((order) => order.id === this.selectedOrder.id) || null
      } catch (error) { this.error = error?.message || 'Failed to load orders' } finally { this.loading = false }
    },
    selectOrder(order) { this.selectedOrder = order; this.message = ''; this.error = '' },
    async recoverOrder(order) {
      if (!this.apiBase || !order || this.actionLoading) return
      this.actionLoading = true; this.error = ''; this.message = ''
      try {
        const response = await fetch(joinApiUrl(this.apiBase, '/orders/recover-fulfillment'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revolutOrderId: order.revolutOrderId }) })
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Fulfillment recovery failed')
        this.message = data.alreadyFulfilled ? 'All providers were already fulfilled.' : 'Fulfillment recovery completed.'
        await this.loadOrders()
      } catch (error) { this.error = error?.message || 'Fulfillment recovery failed' } finally { this.actionLoading = false }
    },
    async importLegacyOrder() {
      if (!this.apiBase || !this.legacyRevolutOrderId.trim() || this.actionLoading) return
      this.actionLoading = true; this.error = ''; this.message = ''
      try {
        const response = await fetch(joinApiUrl(this.apiBase, '/orders/import-legacy'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revolutOrderId: this.legacyRevolutOrderId.trim() }) })
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Legacy order import failed')
        this.message = data.recoveryRequired ? `Legacy order imported. ${data.missingData}` : 'Existing stored order loaded.'
        this.legacyRevolutOrderId = ''
        await this.loadOrders()
        this.selectedOrder = this.orders.find((order) => order.revolutOrderId === data.order?.revolutOrderId) || null
      } catch (error) { this.error = error?.message || 'Legacy order import failed' } finally { this.actionLoading = false }
    },
  },
}
