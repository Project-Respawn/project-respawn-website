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

      <section v-if="!orderComplete" class="checkout-grid">
        <div class="checkout-main">
          <div class="checkout-card checkout-flow">
            <section class="checkout-step" :class="{ 'is-complete': addressComplete }">
              <div class="step-header">
                <div class="step-number">1</div>
                <div class="step-heading">
                  <h2>Delivery address</h2>
                  <p v-if="addressComplete" class="step-summary">
                    {{ customer.fullName }}, {{ customer.address }}, {{ customer.city }}, {{ customer.postcode }}
                  </p>
                  <p v-else class="step-copy">Enter your delivery details before payment.</p>
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

                  <p v-else-if="revolutError" class="payment-status payment-status--error">
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
                  <h2>Review & place order</h2>
                  <p class="step-copy">
                    Review your items and complete payment.
                  </p>
                </div>
              </div>

              <div v-show="activeStep === 'review'" class="step-body">
                <div class="review-list">
                  <article
                    v-for="item in cartItems"
                    :key="item.id"
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
                :key="`summary-${item.id}`"
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
import { useCheckout } from '@/composables/useCheckout'

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

<style scoped>
* {
  box-sizing: border-box;
}

:root {
  --bg-1: #0b1020;
  --bg-2: #12182c;
  --bg-3: #1a223d;
  --panel: rgba(18, 24, 44, 0.88);
  --panel-strong: rgba(16, 22, 40, 0.96);
  --border: rgba(255, 255, 255, 0.08);
  --text: #f3f7ff;
  --muted: #aab7d8;
  --soft: #cfd8f6;
  --danger: #ff8b9a;
  --shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.checkout-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(168, 85, 247, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.07), transparent 24%),
    linear-gradient(180deg, #161b33 0%, #10162a 45%, #0b1020 100%);
  color: var(--text);
  padding: 32px 20px 48px;
}

.checkout-shell {
  max-width: 1320px;
  margin: 0 auto;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
}

.checkout-kicker {
  margin: 0 0 8px;
  color: #c7b8ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.checkout-header h1 {
  margin: 0;
  font-size: clamp(2rem, 1.5rem + 1.4vw, 3rem);
  line-height: 1.05;
}

.checkout-header-meta {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--soft);
  font-size: 14px;
  font-weight: 700;
}

.checkout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 420px);
  gap: 24px;
  align-items: start;
}

.checkout-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.checkout-flow,
.checkout-summary,
.confirmation-card {
  padding: 24px;
}

.checkout-step {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 22px 0;
}

.checkout-step:first-child {
  border-top: 0;
  padding-top: 0;
}

.checkout-step.is-disabled {
  opacity: 0.55;
}

.step-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: start;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: rgba(139, 92, 246, 0.16);
  color: #e9deff;
}

.step-heading h2 {
  margin: 0 0 4px;
  font-size: 24px;
}

.step-copy,
.step-summary {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.step-edit {
  appearance: none;
  border: 0;
  background: transparent;
  color: #c7b8ff;
  cursor: pointer;
  font-weight: 700;
}

.step-body {
  margin-top: 18px;
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: var(--soft);
  font-size: 14px;
  font-weight: 700;
}

.form-group input {
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(140, 160, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  padding: 12px 14px;
  outline: none;
}

.form-group input:focus {
  border-color: rgba(168, 85, 247, 0.48);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.14);
}

.inline-error {
  color: var(--danger);
  font-size: 14px;
  font-weight: 600;
}

.payment-slot-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-slot {
  min-height: 130px;
  border-radius: 16px;
  border: 1px dashed rgba(168, 85, 247, 0.24);
  background: rgba(168, 85, 247, 0.06);
  padding: 16px;
}

.payment-status {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.payment-status--error {
  color: var(--danger);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.review-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.review-item h3 {
  margin: 0 0 6px;
  font-size: 17px;
}

.review-item p {
  margin: 0 0 4px;
  color: var(--muted);
  font-size: 14px;
}

.review-price {
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
}

.checkout-summary.sticky {
  position: sticky;
  top: 24px;
}

.checkout-summary h2 {
  margin: 0 0 20px;
  font-size: 24px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 14px;
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--soft);
}

.summary-row.total {
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text);
  font-size: 18px;
  font-weight: 800;
}

.shipping-old {
  color: var(--soft) !important;
  text-decoration-line: line-through;
  text-decoration-color: var(--soft);
  text-decoration-thickness: 2px;
  opacity: 1;
}

.primary-btn {
  width: 100%;
  margin-top: 20px;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d4aff 100%);
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(109, 74, 255, 0.26);
  transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.primary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.confirmation-wrap {
  max-width: 720px;
}

.confirmation-card h2 {
  margin: 0 0 12px;
  font-size: 32px;
}

.confirmation-card p {
  margin: 0 0 10px;
  color: var(--soft);
}

@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .checkout-summary.sticky {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 20px 14px 40px;
  }

  .checkout-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .checkout-flow,
  .checkout-summary,
  .confirmation-card {
    padding: 18px;
  }

  .step-header {
    grid-template-columns: auto 1fr;
  }

  .step-edit {
    grid-column: 2;
    justify-self: start;
    margin-top: 6px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .review-item {
    flex-direction: column;
  }
}
</style>