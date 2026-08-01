import { computed, nextTick, reactive, ref, watch } from 'vue'
import RevolutCheckout from '@revolut/checkout'
import amplifyOutputs from '../../amplify_outputs.json'

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
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

  const apiBase = import.meta.env.DEV
    ? '/api'
    : (() => {
        const productionBase = import.meta.env.VITE_API_BASE_URL?.trim() || '';

        if (productionBase) {
          if (/<stage>|%3Cstage%3E/i.test(productionBase)) {
            throw new Error(
              'Invalid VITE_API_BASE_URL for production checkout API requests. Remove placeholder "<stage>" and set the real API Gateway base URL in Amplify environment variables.'
            );
          }

          return productionBase.replace(/\/$/, '');
        }

        const endpoint = amplifyOutputs?.custom?.API?.projectRespawnApi?.endpoint?.trim() || '';

        if (!endpoint) {
          throw new Error('Missing VITE_API_BASE_URL for production checkout API requests.');
        }

        return endpoint.replace(/\/$/, '');
      })();

  const revolutMode = (import.meta.env.VITE_REVOLUT_MODE || 'sandbox')
    .trim()
    .toLowerCase()

  const cartItems = ref([
    {
      id: 1,
      name: 'Project Respawn Hoodie',
      variant: 'Large',
      color: 'Black',
      price: 35,
      quantity: 1,
      image: '',
    },
    {
      id: 2,
      name: 'Project Respawn Mug',
      variant: '11oz',
      color: 'White',
      price: 12,
      quantity: 1,
      image: '',
    },
  ])

  const customer = reactive({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
  })

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
      country: 'GB',
      items: cartItems.value.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitAmount: item.price,
      })),
    }

    const response = await fetch(`${apiBase}/revolut/checkout`, {
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
    if (revolutLoading.value || !addressComplete.value) return

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
          countryCode: 'GB',
          city: customer.city,
          postcode: customer.postcode,
          streetLine1: customer.address,
        },
        shippingAddress: {
          countryCode: 'GB',
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
    resetPaymentState()
  }

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
      total: total.value,
      cart: cartItems.value.map((item) => `${item.id}:${item.quantity}`).join('|'),
    }),
    async () => {
      if (!addressComplete.value) return
      if (activeStep.value !== 'payment') return
      if (orderComplete.value) return
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
  }
}