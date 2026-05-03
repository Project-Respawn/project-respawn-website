<template>
  <main class="checkout-container">
    <!-- Header -->
    <header class="checkout-header">
      <button class="back-btn" @click="goBack">← Back to Shop</button>
      <h1>Checkout</h1>
    </header>

    <!-- Content -->
    <div class="checkout-content">
      <!-- Summary Panel -->
      <section class="order-summary">
        <h2>Order Summary</h2>

        <div v-if="cartItems.length" class="cart-items-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-item-row">
            <div class="cart-item-info">
              <img :src="item.image" :alt="item.productTitle" class="item-image" />
              <div class="item-details">
                <h4>{{ item.productTitle }}</h4>
                <p>Qty: {{ item.quantity }}</p>
              </div>
            </div>
            <div class="item-price">
              {{ formatPrice(item.price * item.quantity) }}
            </div>
            <button class="remove-btn" @click="removeFromCart(item.id)">×</button>
          </div>
        </div>

        <div v-else class="empty-cart">
          <p>Your cart is empty</p>
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>{{ formatPrice(shippingCost) }}</span>
          </div>
          <div class="summary-row">
            <span>Tax:</span>
            <span>{{ formatPrice(tax) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
      </section>

      <!-- Form Panel -->
      <section class="checkout-form-section">
        <form @submit.prevent="handleCheckout" class="checkout-form">
          <!-- Delivery Details -->
          <fieldset class="form-section">
            <h3>Delivery Details</h3>

            <div class="form-group">
              abel for="full-name">Full Name *</label>
              <input
                id="full-name"
                v-model="formData.fullName"
                type="text"
                required
              />
            </div>

            <div class="form-group">
              abel for="email">Email *</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
              />
            </div>

            <div class="form-group">
              abel for="phone">Phone *</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
              />
            </div>

            <div class="form-group">
              abel for="address">Address *</label>
              <input
                id="address"
                v-model="formData.address"
                type="text"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                abel for="city">City *</label>
                <input
                  id="city"
                  v-model="formData.city"
                  type="text"
                  required
                />
              </div>
              <div class="form-group">
                abel for="postcode">Postcode *</label>
                <input
                  id="postcode"
                  v-model="formData.postcode"
                  type="text"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              abel for="country">Country *</label>
              <select id="country" v-model="formData.country">
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </fieldset>

          <!-- Shipping -->
          <fieldset class="form-section">
            <h3>Shipping</h3>
            <div class="form-group">
              abel>
                <input
                  v-model="formData.shippingMethod"
                  type="radio"
                  value="STANDARD"
                />
                Standard - FREE
              </label>
            </div>
            <div class="form-group">
              abel>
                <input
                  v-model="formData.shippingMethod"
                  type="radio"
                  value="EXPRESS"
                />
                Express - £5.00
              </label>
            </div>
          </fieldset>

          <!-- Payment -->
          <fieldset class="form-section">
            <h3>Payment</h3>
            <p class="payment-info">Secure payment via Revolut</p>
            <div id="revolut-checkout" class="revolut-container"></div>
          </fieldset>

          <!-- Submit -->
          <button
            type="submit"
            class="checkout-btn"
            :disabled="isProcessing || cartItems.length === 0"
          >
            {{ isProcessing ? 'Processing...' : 'Complete Purchase' }}
          </button>
        </form>

        <!-- Error -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </section>
    </div>

    <!-- Confirmation -->
    <div v-if="showConfirmation" class="confirmation-modal">
      <div class="confirmation-content">
        <h2>✓ Order Confirmed!</h2>
        <p>Thank you for your purchase.</p>
        <div class="order-details">
          <div class="detail-row">
            <span>Order ID:</span>
            <strong>{{ confirmationOrderId }}</strong>
          </div>
        </div>
        <button @click="returnToShop" class="confirmation-btn">
          Continue Shopping
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { createRevolutOrder, createPrintfulOrder, type CartItem } from '@/services/merchService';

const router = useRouter();

const cartItems = ref<CartItem[]>([]);
const isProcessing = ref(false);
const showConfirmation = ref(false);
const confirmationOrderId = ref('');
const error = ref('');
const shippingCost = ref(0);

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postcode: '',
  country: 'GB',
  shippingMethod: 'STANDARD'
});

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const tax = computed(() => {
  return Math.round(subtotal.value * 0.2 * 100) / 100;
});

const total = computed(() => {
  return subtotal.value + tax.value + shippingCost.value;
});

function formatPrice(price: number): string {
  if (typeof price !== 'number' || !isFinite(price)) {
    return '£0.00';
  }
  return `£${price.toFixed(2)}`;
}

function removeFromCart(itemId: string) {
  cartItems.value = cartItems.value.filter(item => item.id !== itemId);
}

function goBack() {
  router.push('/merch');
}

function returnToShop() {
  router.push('/merch');
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

async function handleCheckout() {
  error.value = '';
  isProcessing.value = true;

  try {
    if (!formData.value.fullName || !formData.value.email || !formData.value.address || !formData.value.city) {
      throw new Error('Please fill in all details');
    }

    if (cartItems.value.length === 0) {
      throw new Error('Cart is empty');
    }

    const revolutOrder = await createRevolutOrder({
      amount: total.value,
      currency: 'GBP',
      description: `Project Respawn Merch`,
      customerId: `cust-${Date.now()}`
    });

    if (window.RevolutCheckout) {
      const instance = await window.RevolutCheckout.embed({
        amount: Math.round(total.value * 100),
        currency: 'GBP',
        publicToken: revolutOrder.result?.public_token || '',
        onSuccess: async () => {
          try {
            const printfulOrder = await createPrintfulOrder({
              orderId: `order-${Date.now()}`,
              customerName: formData.value.fullName,
              email: formData.value.email,
              phone: formData.value.phone,
              address: formData.value.address,
              city: formData.value.city,
              postcode: formData.value.postcode,
              country: formData.value.country,
              shippingMethod: formData.value.shippingMethod,
              items: cartItems.value.map(item => ({
                variant_id: item.variantId || item.productId,
                quantity: item.quantity
              }))
            });

            confirmationOrderId.value = printfulOrder.result?.id || `order-${Date.now()}`;
            showConfirmation.value = true;
            cartItems.value = [];
          } catch (err) {
            error.value = 'Payment successful but order failed';
          }
        },
        onError: (err: any) => {
          error.value = err?.message || 'Payment failed';
        },
        onCancel: () => {
          error.value = 'Payment cancelled';
        }
      });
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error occurred';
  } finally {
    isProcessing.value = false;
  }
}

onMounted(async () => {
  try {
    await loadScript('https://sdk.revolut.com/embedded-checkout/embedded-checkout-sdk.js');
  } catch (err) {
    error.value = 'Failed to load payment system';
  }

  const savedCart = localStorage.getItem('merch-cart');
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart);
    } catch (err) {
      console.error('Cart load error:', err);
    }
  }

  window.addEventListener('cart-updated', (event: any) => {
    cartItems.value = event.detail.cart;
    localStorage.setItem('merch-cart', JSON.stringify(cartItems.value));
  });

  watch(() => formData.value.shippingMethod, (method) => {
    shippingCost.value = method === 'EXPRESS' ? 5 : 0;
  });
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.checkout-container {
  min-height: 100vh;
  background: var(--bg, #f5f5f5);
  padding: 40px 20px;
}

.checkout-header {
  max-width: 1200px;
  margin: 0 auto 40px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--accent, #39ff14);
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 20px;
}

.checkout-header h1 {
  font-size: 2.5rem;
  color: var(--text, #000);
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

@media (max-width: 900px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

.order-summary {
  background: var(--surface, #fff);
  padding: 30px;
  border-radius: 8px;
  border: 1px solid rgba(201, 180, 224, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.order-summary h2 {
  font-size: 1.3rem;
  margin-bottom: 20px;
}

.cart-items-list {
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.cart-item-row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(201, 180, 224, 0.1);
  align-items: center;
}

.cart-item-info {
  display: flex;
  gap: 10px;
  flex: 1;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.item-details h4 {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

.item-details p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted, #999);
}

.item-price {
  font-weight: 700;
  color: var(--accent, #39ff14);
}

.remove-btn {
  background: rgba(255, 0, 0, 0.1);
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0 4px;
}

.empty-cart {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted, #999);
}

.summary-section {
  border-top: 2px solid rgba(201, 180, 224, 0.1);
  padding-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.2rem;
  border-top: 1px solid rgba(201, 180, 224, 0.1);
  padding-top: 12px;
  margin-top: 12px;
  color: var(--accent, #39ff14);
}

.checkout-form-section {
  background: var(--surface, #fff);
  padding: 30px;
  border-radius: 8px;
  border: 1px solid rgba(201, 180, 224, 0.1);
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  border: none;
  padding: 0;
}

.form-section h3 {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(201, 180, 224, 0.2);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent, #39ff14);
}

.form-group input[type='radio'] {
  width: auto;
  margin-right: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.payment-info {
  color: var(--muted, #999);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.revolut-container {
  min-height: 300px;
  border: 1px solid rgba(201, 180, 224, 0.2);
  border-radius: 4px;
  padding: 20px;
}

.checkout-btn {
  padding: 14px 20px;
  background: var(--accent, #39ff14);
  color: var(--bg, #000);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ff0000;
  padding: 12px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirmation-content {
  background: var(--surface, #fff);
  padding: 40px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.confirmation-content h2 {
  font-size: 1.8rem;
  color: var(--accent, #39ff14);
  margin-bottom: 10px;
}

.order-details {
  background: rgba(201, 180, 224, 0.05);
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.confirmation-btn {
  padding: 12px 30px;
  background: var(--accent, #39ff14);
  color: var(--bg, #000);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
}

.confirmation-btn:hover {
  transform: translateY(-2px);
}
</style>
