<template>
  <main class="checkout-page">
    <div class="checkout-shell">
      <header class="checkout-header">
        <div>
          <p class="checkout-kicker">Project Respawn Store</p>
          <h1>{{ orderComplete ? 'Payment Submitted' : 'Checkout' }}</h1>
        </div>

        <div v-if="!orderComplete" class="checkout-header-meta">
          {{ cartCount }} item<span v-if="cartCount !== 1">s</span>
        </div>
      </header>

      <div v-if="!orderComplete" class="shipping-notice" role="status">
        <p>Prices include applicable taxes. Shipping is FREE. Sold by Ravens Community, trading as Project Respawn.</p>
        <p v-if="!checkoutEnabled">Checkout is temporarily unavailable while secure release checks are completed. Your basket is safe.</p>
        <p v-if="configurationError">{{ configurationError }}</p>
      </div>

      <section v-if="!orderComplete" class="checkout-grid">
        <div class="checkout-main">
          <div class="checkout-card checkout-flow">
            <section
              class="checkout-step"
              :class="{ 'is-complete': addressComplete }"
            >
              <div class="step-header">
                <div class="step-number">1</div>
                <div class="step-heading">
                  <h2>Delivery address</h2>
                  <p v-if="addressComplete" class="step-summary">
                    {{ customer.fullName }}, {{ customer.address }}, {{ customer.city }}, {{ customer.postcode }}, {{ customer.country }}
                  </p>
                  <p v-else class="step-copy">
                    Enter your delivery details before payment.
                  </p>
                </div>

                <button
                  v-if="addressComplete && activeStep !== 'address' && !paymentStarted"
                  type="button"
                  class="step-edit"
                  @click="activeStep = 'address'"
                >
                  Edit
                </button>
              </div>

              <div v-show="activeStep === 'address'" class="step-body">
                <form class="customer-form" @submit.prevent="saveAddress">
                  <fieldset :disabled="quoting || paymentStarted">
                  <div class="form-group">
                    <label for="full-name">Full Name *</label>
                    <input id="full-name" v-model="customer.fullName" type="text" required />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input id="email" v-model="customer.email" type="email" required />
                  </div>

                  <div class="form-group">
                    <label for="phone">Phone Number (optional)</label>
                    <input id="phone" v-model="customer.phone" type="tel" />
                  </div>

                  <div class="form-group">
                    <label for="address">Street Address *</label>
                    <input id="address" v-model="customer.address" type="text" required />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="city">City *</label>
                      <input id="city" v-model="customer.city" type="text" required />
                    </div>

                    <div class="form-group">
                      <label for="postcode">Postcode *</label>
                      <input id="postcode" v-model="customer.postcode" type="text" required />
                    </div>
                  </div>

                  <div v-if="['US', 'CA', 'AU'].includes(customer.country)" class="form-group"><label for="shipping-state">State / province code *</label><input id="shipping-state" v-model="customer.state" maxlength="10" required></div>
                  <div class="form-group">
                    <label for="country">Country *</label>
                    <select id="country" v-model="customer.country" required>
                      <option value="">Select your country</option>
                      <option v-for="code in destinations" :key="code" :value="code">{{ code }}</option>
                    </select>
                  </div>

                  <div v-if="addressError" class="inline-error">
                    {{ addressError }}
                  </div>

                  <button type="submit" class="primary-btn" :disabled="quoting || !checkoutEnabled || paymentStarted">
                    {{ quoting ? 'Checking your total...' : 'Review all-inclusive total' }}
                  </button>
                  </fieldset>
                </form>
              </div>
            </section>

            <section
              class="checkout-step"
              :class="{
                'is-disabled': !addressComplete,
                'is-complete': paymentReady
              }"
            >
              <div class="step-header">
                <div class="step-number">2</div>
                <div class="step-heading">
                  <h2>Payment method</h2>
                  <p v-if="!addressComplete" class="step-copy">
                    Complete your delivery details first.
                  </p>
                  <p v-else-if="paymentReady" class="step-summary">
                    Choose your preferred payment method below
                  </p>
                  <p v-else class="step-copy">
                    Your secure payment form will load below.
                  </p>
                </div>

                <button
                  v-if="addressComplete && activeStep !== 'payment'"
                  type="button"
                  class="step-edit"
                  @click="activeStep = 'payment'"
                >
                  Edit
                </button>
              </div>

              <div v-show="activeStep === 'payment'" class="step-body">
                <div class="payment-slot-wrap">
                  <div id="revolut-checkout" class="payment-slot"></div>

                  <p v-if="revolutLoading" class="payment-status">
                    Loading payment form...
                  </p>

                  <p
                    v-else-if="revolutError"
                    class="payment-status payment-status--error"
                  >
                    {{ revolutError }}
                  </p>

                  <p v-else-if="!paymentReady" class="payment-status">
                    Payment form will appear here once your address is confirmed.
                  </p>
                </div>

              </div>
            </section>
          </div>
        </div>

        <aside class="checkout-sidebar">
          <div class="checkout-card checkout-summary sticky">
            <h2>Order Summary</h2>
            <label>Payment currency<select v-model="currency" :disabled="orderComplete || paymentStarted || quoting"><option v-for="code in currencyCodes" :key="code" :value="code">{{ code }}</option></select></label>

           <div class="summary-items">
  <div
    v-for="item in cartItems"
    :key="`summary-${item.id}-${item.variant || ''}-${item.color || ''}-${item.quantity}`"
    class="summary-item"
  >
    <div class="summary-item-main">
      <div class="summary-item-info">
        <div class="summary-item-details">
          <span>{{ item.name }}</span>
          <small v-if="item.color">Colour: {{ item.color }}</small>
          <small v-if="item.size">Size: {{ item.size }}</small>
          <small>Quantity: {{ item.quantity }}</small>
        </div>
        <button
          type="button"
          class="remove-item-btn summary-remove-btn" :disabled="paymentStarted || quoting"
          @click="removeCartItem(item)"
        >
          Remove
        </button>
      </div>

      <span>{{ hasAuthoritativeQuote ? formatMoney(item.price * item.quantity) : 'Awaiting server quote' }}</span>
    </div>
  </div>
</div>

            <div class="summary-block">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatMoney(subtotal) }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span class="shipping-quote">FREE</span>
              </div>

              <div class="summary-row"><span>Tax included</span><span>{{ formatMoney(taxTotal) }}</span></div>
              <div class="summary-row total">
                <span>Total</span>
                <span>{{ formatMoney(total) }}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section v-if="orderComplete" class="confirmation-wrap">
        <div class="checkout-card confirmation-card">
          <h2>Payment Submitted</h2>
          <p>Thank you. We will verify your payment before processing your order.</p>
          <p>Guest access remains in this browser tab. Keep your order reference; it is not an access credential.</p>
          <p>Order ID: <strong>{{ orderId }}</strong></p>
          <p>Order total: <strong>{{ formatMoney(total) }}</strong>. Shipping FREE. Applicable tax included.</p>
          <p v-if="fulfillmentError" class="payment-status">
            {{ fulfillmentError }}
          </p>
          <p v-else>Your order is awaiting verification.</p>

          <button type="button" class="primary-btn" :disabled="!canStartNewOrder" @click="resetCheckout">
            Continue Shopping
          </button>
        </div>
      </section>
      <section class="checkout-card order-status-lookup">
        <h2>Check an existing order</h2>
        <p>Sign in to the account that placed the order. Guest access remains in the original checkout tab.</p>
        <form @submit.prevent="lookupOrderStatus">
          <label for="order-reference">Order reference</label>
          <input id="order-reference" v-model="statusReference" type="text" maxlength="39" required autocomplete="off" />
          <button class="primary-btn" type="submit" :disabled="statusLookupBusy">{{ statusLookupBusy ? 'Checking...' : 'Check order status' }}</button>
        </form>
        <p role="status" aria-live="polite">{{ statusLookupMessage }}</p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useCheckout } from '../../composables/useCheckout'

const {
  statusReference, statusLookupMessage, statusLookupBusy, lookupOrderStatus, canStartNewOrder,
  formatMoney, quoting, checkoutEnabled, destinations, configurationError, paymentStarted,
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
  taxTotal,
  hasAuthoritativeQuote,
  currency,
  currencyCodes,
  cartItems,
  customer,
  cartCount,
  subtotal,
  total,
  saveAddress,
  resetCheckout,
  removeCartItem,
} = useCheckout()
</script>

<style scoped src="./Checkout.css"></style>
