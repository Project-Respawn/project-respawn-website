<template>
  <main class="checkout-page">
    <div class="checkout-shell">
      <header class="checkout-header">
        <div>
          <p class="checkout-kicker">Project Respawn Store</p>
          <h1>{{ orderComplete ? 'Order Confirmed' : 'Checkout' }}</h1>
        </div>

        <div v-if="!orderComplete" class="checkout-header-meta">
          {{ cartCount }} item<span v-if="cartCount !== 1">s</span>
        </div>
      </header>

      <div v-if="!orderComplete" class="shipping-notice" role="note">
        <p>
          We currently ship to the UK, Europe, and the USA only.
          If you are ordering from another location, please contact us before placing an order
          so we can discuss shipping options and pricing.
        </p>
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
                  v-if="addressComplete && activeStep !== 'address'"
                  type="button"
                  class="step-edit"
                  @click="activeStep = 'address'"
                >
                  Edit
                </button>
              </div>

              <div v-show="activeStep === 'address'" class="step-body">
                <form class="customer-form" @submit.prevent="saveAddress">
                  <div class="form-group">
                    <label for="full-name">Full Name *</label>
                    <input id="full-name" v-model="customer.fullName" type="text" required />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input id="email" v-model="customer.email" type="email" required />
                  </div>

                  <div class="form-group">
                    <label for="phone">Phone Number *</label>
                    <input id="phone" v-model="customer.phone" type="tel" required />
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

                  <div class="form-group">
                    <label for="country">Country *</label>
                    <select id="country" v-model="customer.country" required>
                      <option value="">Select your country</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="IE">Ireland</option>
                      <option value="FR">France</option>
                      <option value="DE">Germany</option>
                      <option value="ES">Spain</option>
                      <option value="IT">Italy</option>
                      <option value="NL">Netherlands</option>
                      <option value="BE">Belgium</option>
                      <option value="PT">Portugal</option>
                      <option value="SE">Sweden</option>
                      <option value="DK">Denmark</option>
                      <option value="FI">Finland</option>
                      <option value="NO">Norway</option>
                      <option value="PL">Poland</option>
                      <option value="AT">Austria</option>
                      <option value="CH">Switzerland</option>
                    </select>
                  </div>

                  <div v-if="addressError" class="inline-error">
                    {{ addressError }}
                  </div>

                  <button type="submit" class="primary-btn">
                    Use this address
                  </button>
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
                    Card details ready
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

                <button
                  type="button"
                  class="primary-btn"
                  :disabled="!paymentReady"
                  @click="goToReview"
                >
                  Continue to review
                </button>
              </div>
            </section>

            <section
              class="checkout-step"
              :class="{ 'is-disabled': !paymentReady }"
            >
              <div class="step-header">
                <div class="step-number">3</div>
                <div class="step-heading">
                  <h2>Review &amp; place order</h2>
                  <p class="step-copy">
                    Review your items and complete payment.
                  </p>
                </div>
              </div>

              <div v-show="activeStep === 'review'" class="step-body">
                <div class="review-list">
                  <article
                    v-for="item in cartItems"
                    :key="`${item.id}-${item.variant || ''}-${item.color || ''}-${item.quantity}`"
                    class="review-item"
                  >
                    <div>
                      <h3>{{ item.name }}</h3>
                      <p v-if="item.variant">{{ item.variant }}</p>
                      <p v-if="item.color">Colour: {{ item.color }}</p>
                      <p>Quantity: {{ item.quantity }}</p>
                    </div>

                    <div class="review-price">
                      £{{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                  </article>
                </div>

                <button
                  type="button"
                  class="primary-btn"
                  :disabled="submittingPayment || !paymentReady"
                  @click="handlePayment"
                >
                  {{ submittingPayment ? 'Processing...' : 'Place order' }}
                </button>
              </div>
            </section>
          </div>
        </div>

        <aside class="checkout-sidebar">
          <div class="checkout-card checkout-summary sticky">
            <h2>Order Summary</h2>

            <div class="summary-items">
              <div
                v-for="item in cartItems"
                :key="`summary-${item.id}-${item.variant || ''}-${item.color || ''}-${item.quantity}`"
                class="summary-item"
              >
                <span>{{ item.name }} × {{ item.quantity }}</span>
                <span>£{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <div class="summary-block">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>£{{ subtotal.toFixed(2) }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span class="shipping-old">£{{ originalShipping.toFixed(2) }}</span>
              </div>

              <div class="summary-row total">
                <span>Total</span>
                <span>£{{ total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section v-if="orderComplete" class="confirmation-wrap">
        <div class="checkout-card confirmation-card">
          <h2>✅ Order Confirmed!</h2>
          <p>Thank you for your purchase.</p>
          <p>Order ID: <strong>{{ orderId }}</strong></p>
          <p>Your order will be printed and shipped within 3–5 business days.</p>

          <button type="button" class="primary-btn" @click="resetCheckout">
            Continue Shopping
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useCheckout } from '../../composables/useCheckout'

const {
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
} = useCheckout()
</script>

<style scoped src="./Checkout.css"></style>