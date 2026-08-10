import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import RevolutCheckout from '@revolut/checkout'
import { getApiBaseUrl, joinApiUrl } from '../config/apiBaseUrl'

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}

function resolveRevolutMode() {
  const configuredMode = String(import.meta.env.VITE_REVOLUT_MODE || '')
    .trim()
    .toLowerCase()

  if (!configuredMode) {
    throw new Error('Missing VITE_REVOLUT_MODE. Set it explicitly to live or sandbox.')
  }

  if (configuredMode === 'live') {
    return 'prod'
  }

  if (configuredMode === 'sandbox') {
    return 'sandbox'
  }

  throw new Error('Invalid VITE_REVOLUT_MODE. Expected live or sandbox.')
}

function resolveRevolutPublicKey() {
  const publicKey = String(import.meta.env.VITE_REVOLUT_PUBLIC_KEY || '').trim()

  if (!publicKey) {
    throw new Error('Missing VITE_REVOLUT_PUBLIC_KEY for Revolut Checkout.')
  }

  return publicKey
}

function normaliseCartItem(item, index) {
  const title =
    item?.name ??
    item?.title ??
    item?.productTitle ??
    item?.product_name

  return {
    id: item?.id ?? item?.productId ?? `item-${index}`,
    name: title || 'Product',
    variant: item?.variant ?? item?.variantName ?? item?.size ?? '',
    color: item?.color ?? '',
    price: Number(item?.price ?? item?.unitPrice ?? 0),
    quantity: Number(item?.quantity ?? item?.qty ?? 1),
    image: item?.image ?? item?.thumbnailUrl ?? '',
    variantId: item?.variantId ?? '',
    fulfillmentProvider: item?.fulfillmentProvider ?? '',
    fulfillmentVariantId: item?.fulfillmentVariantId ?? '',
    productId: item?.productId ?? item?.id ?? `item-${index}`,
  }
}

const ALLOWED_COUNTRIES = new Set([
  'GB',
  'US',
  'IE',
  'FR',
  'DE',
  'ES',
  'IT',
  'NL',
  'BE',
  'PT',
  'SE',
  'DK',
  'FI',
  'NO',
  'PL',
  'AT',
  'CH',
])

function isAllowedShippingCountry(countryCode) {
  return ALLOWED_COUNTRIES.has(String(countryCode || '').trim().toUpperCase())
}

export function useCheckout() {
  const originalShipping = 5

  const activeStep = ref('address')
  const orderComplete = ref(false)
  const orderId = ref('')

  const addressComplete = ref(false)
  const addressError = ref('')

  const revolutLoading = ref(false)
  const revolutError = ref('')
  const paymentReady = ref(false)
  const revolutEmbeddedCheckout = ref(null)
  const activeRevolutOrder = ref(null)
  let orderCreationPromise = null
  const autoMountQueued = ref(false)
  const fulfillmentError = ref('')
  const fulfillmentAttempts = new Set()

  const apiBase = getApiBaseUrl('checkout API requests')

  const revolutMode = resolveRevolutMode()
  const revolutPublicKey = resolveRevolutPublicKey()
  console.log('Resolved frontend Revolut mode:', revolutMode)

  const cartItems = ref([])

  const customer = reactive({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
  })

  function loadCart() {
    try {
      const parsedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const rawItems = Array.isArray(parsedCart) ? parsedCart : []
      cartItems.value = rawItems.map(normaliseCartItem)
    } catch {
      cartItems.value = []
    }
  }

  function persistCart(items) {
    localStorage.setItem('cart', JSON.stringify(items))
    cartItems.value = items.map(normaliseCartItem)
    window.dispatchEvent(new Event('cart-updated'))
  }

  function removeCartItem(itemToRemove) {
    const updated = cartItems.value.filter((item) => {
      return !(
        String(item.productId || item.id) === String(itemToRemove.productId || itemToRemove.id) &&
        String(item.variantId || '') === String(itemToRemove.variantId || '') &&
        String(item.color || '') === String(itemToRemove.color || '')
      )
    })

    persistCart(updated)
    if (!updated.length) {
      paymentReady.value = false
      activeStep.value = addressComplete.value ? 'address' : 'address'
      resetPaymentState()
    }
  }

  const cartCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const total = computed(() => subtotal.value)

  function validateCustomerDetails() {
    if (!customer.fullName.trim()) throw new Error('Full name is required')
    if (!customer.email.trim()) throw new Error('Email address is required')
    if (!customer.phone.trim()) throw new Error('Phone number is required')
    if (!customer.address.trim()) throw new Error('Street address is required')
    if (!customer.city.trim()) throw new Error('City is required')
    if (!customer.postcode.trim()) throw new Error('Postcode is required')
    if (!customer.country.trim()) throw new Error('Country is required')

    if (!isAllowedShippingCountry(customer.country)) {
      throw new Error('We currently only ship to the UK, Europe, and the USA. Please contact us for other locations.')
    }

    if (!cartItems.value.length) throw new Error('Your cart is empty')
  }

  function destroyEmbeddedCheckout() {
    try {
      if (revolutEmbeddedCheckout.value && typeof revolutEmbeddedCheckout.value.destroy === 'function') {
        revolutEmbeddedCheckout.value.destroy()
      }
    } catch (error) {
      console.warn('Failed to destroy embedded checkout', error)
    }

    revolutEmbeddedCheckout.value = null
    paymentReady.value = false
  }

  function resetPaymentState() {
    activeRevolutOrder.value = null
    orderCreationPromise = null
    revolutError.value = ''
    autoMountQueued.value = false
    destroyEmbeddedCheckout()
  }

  function saveAddress() {
    addressError.value = ''

    try {
      validateCustomerDetails()
      addressComplete.value = true
      activeStep.value = 'payment'
      resetPaymentState()
    } catch (error) {
      addressComplete.value = false
      addressError.value = getErrorMessage(
        error,
        'Please complete all required fields.'
      )
    }
  }

  async function createRevolutOrder() {
    if (!apiBase) {
      throw new Error('Missing API base URL for checkout')
    }

    const payload = {
      amount: Number(total.value.toFixed(2)),
      currency: 'GBP',
      description: 'Project Respawn Merch Order',
      orderId: `PR-${Date.now()}`,
      email: customer.email,
      customerName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postcode: customer.postcode,
      country: customer.country,
      items: cartItems.value.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitAmount: item.price,
      })),
    }

    const response = await fetch(joinApiUrl(apiBase, '/revolut/checkout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          data?.revolut?.message ||
          'Failed to create Revolut order'
      )
    }

    console.log('Revolut checkout response status:', response.status)

    const token =
      data?.order?.token ||
      data?.token ||
      data?.public_id ||
      data?.orderToken

    const id = data?.order?.id || data?.id || data?.orderId

    console.log('Revolut order token present:', Boolean(token))
    console.log('Revolut order id present:', Boolean(id))
    console.log('Resolved frontend Revolut mode:', revolutMode)

    if (!token) {
      throw new Error('Backend did not return a Revolut order token')
    }

    const backendMode = String(data?.mode || '').trim().toLowerCase()

    if (backendMode !== revolutMode) {
      throw new Error(
        `Revolut environment mismatch: frontend is ${revolutMode}, backend is ${backendMode || 'unknown'}.`
      )
    }

    return {
      token,
      id: id || `PR-${Date.now()}`,
      mode: backendMode,
    }
  }

  async function dispatchFulfillment(revolutOrderId) {
    if (!apiBase) {
      throw new Error('Missing API base URL for fulfillment')
    }

    if (fulfillmentAttempts.has(revolutOrderId)) {
      return false
    }

    fulfillmentAttempts.add(revolutOrderId)

    const payload = {
      projectOrderId: revolutOrderId,
      revolutOrderId,
      paymentAmount: Number(total.value.toFixed(2)),
      currency: 'GBP',
      items: cartItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        fulfillmentProvider: item.fulfillmentProvider || 'manual',
        fulfillmentVariantId: item.fulfillmentVariantId || null,
      })),
      customerName: customer.fullName,
      email: customer.email,
      shippingAddress: { address: customer.address, city: customer.city, postcode: customer.postcode, country: customer.country },
    }

    console.log('Dispatching fulfillment')

    const response = await fetch(joinApiUrl(apiBase, '/orders/fulfill'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('Fulfillment response status:', response.status)

    if (!response.ok) {
      throw new Error('Fulfillment dispatch failed')
    }

    const result = await response.json().catch(() => null)
    return Boolean(result?.success)
  }

  async function completePaidOrder(order) {
    if (fulfillmentAttempts.has(order.id)) {
      return
    }

    console.log('Revolut payment successful')
    orderId.value = order.id
    orderComplete.value = true

    try {
      const created = await dispatchFulfillment(order.id)

      if (created) {
        localStorage.removeItem('cart')
        cartItems.value = []
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch (error) {
      fulfillmentError.value = 'Payment succeeded, but we could not submit your order for fulfillment. Please contact support with your order ID.'
      console.error('Fulfillment dispatch failed after successful payment', error)
    }
  }

  async function createEmbeddedCheckoutOrder() {
    if (orderCreationPromise) return orderCreationPromise

    orderCreationPromise = createRevolutOrder()

    try {
      const order = await orderCreationPromise
      activeRevolutOrder.value = order
      return { publicId: order.token }
    } finally {
      orderCreationPromise = null
    }
  }

  async function mountPaymentField() {
    if (revolutLoading.value || !addressComplete.value || !cartItems.value.length) return

    revolutLoading.value = true
    revolutError.value = ''

    try {
      destroyEmbeddedCheckout()
      await nextTick()

      const mountTarget = document.getElementById('revolut-checkout')
      if (!mountTarget) {
        throw new Error('Payment container not found')
      }

      const embeddedCheckout = await RevolutCheckout.embeddedCheckout({
        publicToken: revolutPublicKey,
        mode: revolutMode,
        target: mountTarget,
        locale: 'en',
        email: customer.email,
        billingAddress: {
          countryCode: customer.country,
          city: customer.city,
          postcode: customer.postcode,
          streetLine1: customer.address,
        },
        createOrder: createEmbeddedCheckoutOrder,
        onSuccess({ orderId: paidOrderId }) {
          const order = activeRevolutOrder.value
          activeRevolutOrder.value = null
          const resolvedOrderId = paidOrderId || order?.id

          if (!resolvedOrderId) {
            revolutError.value = 'Payment completed, but the Revolut order ID was not returned. Please contact support.'
            return
          }

          void completePaidOrder({
            id: resolvedOrderId,
          })
        },
        onError({ error }) {
          revolutError.value = getErrorMessage(
            error,
            'Payment failed. Please try again.'
          )
          activeRevolutOrder.value = null
        },
        onCancel() {
          revolutError.value = 'Payment was cancelled. You can try again.'
          activeRevolutOrder.value = null
        },
      })

      revolutEmbeddedCheckout.value = embeddedCheckout
      paymentReady.value = true
    } catch (error) {
      revolutError.value = getErrorMessage(error, 'Unable to load payment form.')
      paymentReady.value = false
    } finally {
      revolutLoading.value = false
      autoMountQueued.value = false
    }
  }

  function resetCheckout() {
    loadCart()
    orderComplete.value = false
    orderId.value = ''
    addressComplete.value = false
    addressError.value = ''
    activeStep.value = 'address'
    customer.fullName = ''
    customer.email = ''
    customer.phone = ''
    customer.address = ''
    customer.city = ''
    customer.postcode = ''
    customer.country = ''
    resetPaymentState()
  }

  function handleLocalCartUpdate() {
    loadCart()
  }

  loadCart()

  window.addEventListener('storage', handleLocalCartUpdate)
  window.addEventListener('cart-updated', handleLocalCartUpdate)

  watch(
    () => ({
      addressComplete: addressComplete.value,
      activeStep: activeStep.value,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postcode: customer.postcode,
      country: customer.country,
      total: total.value,
      cart: cartItems.value.map((item) => `${item.id}:${item.quantity}`).join('|'),
    }),
    async () => {
      if (!addressComplete.value) return
      if (activeStep.value !== 'payment') return
      if (orderComplete.value) return
      if (!cartItems.value.length) return
      if (revolutLoading.value || autoMountQueued.value) return
      if (paymentReady.value) return

      autoMountQueued.value = true
      await nextTick()
      await mountPaymentField()
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    destroyEmbeddedCheckout()
    window.removeEventListener('storage', handleLocalCartUpdate)
    window.removeEventListener('cart-updated', handleLocalCartUpdate)
  })

  return {
    activeStep,
    orderComplete,
    orderId,
    addressComplete,
    addressError,
    revolutLoading,
    revolutError,
    fulfillmentError,
    paymentReady,
    originalShipping,
    cartItems,
    customer,
    cartCount,
    subtotal,
    total,
    saveAddress,
    resetCheckout,
    removeCartItem,
  }
}
