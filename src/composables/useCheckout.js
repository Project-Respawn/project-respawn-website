import { computed, nextTick, reactive, ref, watch } from 'vue'
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
    return import.meta.env.PROD ? 'prod' : 'sandbox'
  }

  if (configuredMode === 'prod' || configuredMode === 'production' || configuredMode === 'live') {
    return 'prod'
  }

  if (configuredMode === 'sandbox') {
    return 'sandbox'
  }

  throw new Error('Invalid VITE_REVOLUT_MODE. Expected prod, production, live, or sandbox.')
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
  const submittingPayment = ref(false)

  const revolutCheckoutInstance = ref(null)
  const revolutCardField = ref(null)
  const latestOrderToken = ref('')
  const autoMountQueued = ref(false)

  const apiBase = getApiBaseUrl('checkout API requests')

  const revolutMode = resolveRevolutMode()
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

  function destroyCardField() {
    try {
      if (revolutCardField.value && typeof revolutCardField.value.destroy === 'function') {
        revolutCardField.value.destroy()
      }
    } catch (error) {
      console.warn('Failed to destroy card field', error)
    }

    revolutCardField.value = null
    revolutCheckoutInstance.value = null
    paymentReady.value = false
  }

  function resetPaymentState() {
    latestOrderToken.value = ''
    revolutError.value = ''
    autoMountQueued.value = false
    destroyCardField()
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

  function goToReview() {
    if (!paymentReady.value) return
    activeStep.value = 'review'
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

    const token =
      data?.order?.token ||
      data?.token ||
      data?.public_id ||
      data?.orderToken

    if (!token) {
      throw new Error('Backend did not return a Revolut order token')
    }

    return {
      token,
      id: data?.order?.id || data?.id || data?.orderId || `PR-${Date.now()}`,
    }
  }

  async function mountPaymentField() {
    if (revolutLoading.value || !addressComplete.value || !cartItems.value.length) return

    revolutLoading.value = true
    revolutError.value = ''

    try {
      destroyCardField()
      await nextTick()

      const mountTarget = document.getElementById('revolut-checkout')
      if (!mountTarget) {
        throw new Error('Payment container not found')
      }

      const order = await createRevolutOrder()
      latestOrderToken.value = order.token

      const instance = await RevolutCheckout(order.token, revolutMode)
      revolutCheckoutInstance.value = instance

      const cardField = instance.createCardField({
        target: mountTarget,
        locale: 'en',
        onSuccess() {
          orderId.value = order.id
          orderComplete.value = true
          submittingPayment.value = false
          localStorage.removeItem('cart')
          cartItems.value = []
          window.dispatchEvent(new Event('cart-updated'))
        },
        onError(error) {
          revolutError.value = getErrorMessage(
            error,
            'Payment failed. Please try again.'
          )
          submittingPayment.value = false
        },
        onValidation(errors) {
          console.log('Revolut validation:', errors)
        },
        onStatusChange(status) {
          console.log('Revolut status:', status)
        },
      })

      revolutCardField.value = cardField
      paymentReady.value = true
    } catch (error) {
      revolutError.value = getErrorMessage(error, 'Unable to load payment form.')
      paymentReady.value = false
    } finally {
      revolutLoading.value = false
      autoMountQueued.value = false
    }
  }

  async function handlePayment() {
    revolutError.value = ''

    try {
      if (!paymentReady.value || !revolutCardField.value) {
        throw new Error('Payment form is still loading. Please wait a moment.')
      }

      submittingPayment.value = true

      await revolutCardField.value.submit({
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        billingAddress: {
          countryCode: customer.country,
          city: customer.city,
          postcode: customer.postcode,
          streetLine1: customer.address,
        },
        shippingAddress: {
          countryCode: customer.country,
          city: customer.city,
          postcode: customer.postcode,
          streetLine1: customer.address,
        },
      })
    } catch (error) {
      revolutError.value = getErrorMessage(error, 'Unable to submit payment.')
      submittingPayment.value = false
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
      if (revolutLoading.value || submittingPayment.value || autoMountQueued.value) return
      if (paymentReady.value) return

      autoMountQueued.value = true
      await nextTick()
      await mountPaymentField()
    },
    { deep: true }
  )

  return {
    activeStep,
    orderComplete,
    orderId,
    addressComplete,
    addressError,
    revolutLoading,
    revolutError,
    paymentReady,
    submittingPayment,
    originalShipping,
    cartItems,
    customer,
    cartCount,
    subtotal,
    total,
    saveAddress,
    goToReview,
    handlePayment,
    resetCheckout,
    removeCartItem,
  }
}
