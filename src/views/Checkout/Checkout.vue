<template>
  <main class="checkout-container">
    <!-- Header -->
    <header class="checkout-header">
      <button class="back-btn" @click="goBack">← Back to Shop</button>
      <h1>Checkout</h1>
    </header>

    <!-- Two Column Layout -->
    <div class="checkout-content">
      <!-- Left: Order Summary -->
      <section class="order-summary">
        <h2>Order Summary</h2>

        <!-- Cart Items -->
        <div v-if="cartItems.length" class="cart-items-list">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="cart-item-row"
          >
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

        <!-- Empty Cart Message -->
        <div v-else class="empty-cart">
          <p>Your cart is empty</p>
          <router-link to="/merch" class="back-to-shop">← Back to Shop</router-link>
        </div>

        <!-- Summary -->
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
            <span>Tax (est):</span>
            <span>{{ formatPrice(tax) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
      </section>

      <!-- Right: Checkout Form -->
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
                placeholder="John Doe"
              />
            </div>

            <div class="form-group">
              abel for="email">Email Address *</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="john@example.com"
              />
            </div>

            <div class="form-group">
              abel for="phone">Phone Number *</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
                placeholder="+44 20 1234 5678"
              />
            </div>

            <div class="form-group">
              abel for="address">Street Address *</label>
              <input
                id="address"
                v-model="formData.address"
                type="text"
                required
                placeholder="123 High Street"
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
                  placeholder="London"
                />
              </div>
              <div class="form-group">
                abel for="postcode">Postcode *</label>
                <input
                  id="postcode"
                  v-model="formData.postcode"
                  type="text"
                  required
                  placeholder="SW1A 1AA"
                />
              </div>
            </div>

            <div class="form-group">
              abel for="country">Country *</label>
              <select id="country" v-model="formData.country" required>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="IE">Ireland</option>
              </select>
            </div>
          </fieldset>

          <!-- Shipping Method -->
          <fieldset class="form-section">
            <h3>Shipping Method</h3>
            <div class="form-group">
              abel>
                <input
                  v-model="formData.shippingMethod"
                  type="radio"
                  value="STANDARD"
                  required
                />
                Standard (5-7 days) - FREE
              </label>
            </div>
            <div class="form-group">
              abel>
                <input
                  v-model="formData.shippingMethod"
                  type="radio"
                  value="EXPRESS"
                  required
                />
                Express (2-3 days) - £5.00
              </label>
            </div>
          </fieldset>

          <!-- Payment Section -->
          <fieldset class="form-section">
            <h3>Payment Method</h3>
            <p class="payment-info">
              Secure payment via Revolut. Your payment details are never stored.
            </p>
            <div id="revolut-checkout" class="revolut-container"></div>
          </fieldset>

          <!-- Submit Button -->
          <button
            type="submit"
            class="checkout-btn"
            :disabled="isProcessing || cartItems.length === 0"
          >
            {{ isProcessing ? 'Processing...' : 'Complete Purchase' }}
          </button>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </section>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="confirmation-modal">
      <div class="confirmation-content">
        <h2>✓ Order Confirmed!</h2>
        <p>Thank you for your purchase.</p>
        <div class="order-details">
          <div class="detail-row">
            <span>Order ID:</span>
            <strong>{{ confirmationOrderId }}</strong>
          </div>
          <div class="detail-row">
            <span>Customer:</span>
            <strong>{{ formData.fullName }}</strong>
          </div>
          <div class="detail-row">
            <span>Total:</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>
        </div>
        <p class="confirmation-message">
          Your order will be printed and shipped within 3-5 business days.
          A tracking number will be sent to {{ formData.email }}.
        </p>
        <button @click="returnToShop" class="confirmation-btn">
          Continue Shopping
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  createRevolutOrder,
  createPrintfulOrder,
  type CartItem
} from '@/services/merchService';

// ===== ROUTER =====
const router = useRouter();

// ===== STATE =====
const cartItems = ref<CartItem[]>([]);
const isProcessing = ref<boolean>(false);
const showConfirmation = ref<boolean>(false);
const confirmationOrderId = ref<string>('');
const error = ref<string>('');

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postcode: 'GB',
  country: 'GB',
  shippingMethod: 'STANDARD'
});

const shippingCost = ref<number>(0);

// ===== COMPUTED =====
const subtotal = computed<number>(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const tax = computed<number>(() => {
  return Math.round(subtotal.value * 0.2 * 100) / 100; // 20% VAT for UK
});

const total = computed<number>(() => {
  return subtotal.value + tax.value + shippingCost.value;
});

// ===== METHODS =====
function formatPrice(price: number): string {
  if (typeof price !== 'number' || !isFinite(price)) {
    return '£0.00';
  }
  return `£${price.toFixed(2)}`;
}

function removeFromCart(itemId: string) {
  cartItems.value = cartItems.value.filter((item) => item.id !== itemId);
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
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function handleCheckout() {
  error.value = '';
  isProcessing.value = true;

  try {
    // Validate form
    if (
      !formData.value.fullName ||
      !formData.value.email ||
      !formData.value.phone ||
      !formData.value.address ||
      !formData.value.city ||
      !formData.value.postcode
    ) {
      throw new Error('Please fill in all delivery details');
    }

    if (cartItems.value.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Step 1: Create Revolut checkout order
    console.log('Creating Revolut order...');
    const revolutOrder = await createRevolutOrder({
      amount: total.value,
      currency: 'GBP',
      description: `Project Respawn Merch Order - ${formData.value.fullName}`,
      customerId: `cust-${Date.now()}`
    });

    console.log('Revolut order created:', revolutOrder);

    // Step 2: Initialize Revolut Embedded Checkout
    if (window.RevolutCheckout) {
      const instance = await window.RevolutCheckout.embed({
        amount: Math.round(total.value * 100), // Convert to pence
        currency: 'GBP',
        publicToken: revolutOrder.result?.public_token || '',
        onSuccess: async () => {
          console.log('Payment successful!');
          
          // Step 3: Create Printful order
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
              items: cartItems.value.map((item) => ({
                variant_id: item.variantId || item.productId,
                quantity: item.quantity
              }))
            });

            console.log('Printful order created:', printfulOrder);

            // Show confirmation
            confirmationOrderId.value = printfulOrder.result?.id || `order-${Date.now()}`;
            showConfirmation.value = true;
            cartItems.value = [];

            // Clear form
            setTimeout(() => {
              formData.value = {
                fullName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postcode: 'GB',
                country: 'GB',
                shippingMethod: 'STANDARD'
              };
            }, 2000);
          } catch (printfulError) {
            console.error('Printful order error:', printfulError);
            error.value = 'Payment successful but order creation failed. Please contact support.';
          }
        },
        onError: (errorData: any) => {
          console.error('Payment failed:', errorData);
          error.value = errorData?.message || 'Payment failed. Please try again.';
        },
        onCancel: () => {
          console.log('Payment cancelled');
          error.value = 'Payment cancelled. Please try again.';
        }
      });
    } else {
      throw new Error('Revolut SDK not loaded');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    error.value = err instanceof Error ? err.message : 'An error occurred. Please try again.';
  } finally {
    isProcessing.value = false;
  }
}

// ===== LIFECYCLE =====
onMounted(async () => {
  // Load Revolut SDK
  try {
    await loadScript('https://sdk.revolut.com/embedded-checkout/embedded-checkout-sdk.js');
    console.log('Revolut SDK loaded');
  } catch (err) {
    console.error('Failed to load Revolut SDK:', err);
    error.value = 'Failed to load payment system. Please refresh the page.';
  }

  // Load cart from localStorage or event
  const savedCart = localStorage.getItem('merch-cart');
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }

  // Listen for cart updates
  window.addEventListener('cart-updated', (event: any) => {
    cartItems.value = event.detail.cart;
    localStorage.setItem('merch-cart', JSON.stringify(cartItems.value));
  });

  // Update shipping cost based on method
  const updateShipping = () => {
    shippingCost.value = formData.value.shippingMethod === 'EXPRESS' ? 5 : 0;
  };
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
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
}

.checkout-header h1 {
  font-size: 2.5rem;
  color: var(--text, #000);
  margin-bottom: 20px;
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
    gap: 20px;
  }
}

/* ORDER SUMMARY */
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
  color: var(--text, #000);
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
  color: var(--text, #000);
}

.item-details p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted, #999);
}

.item-price {
  font-weight: 700;
  color: var(--accent, #39ff14);
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  background: rgba(255, 0, 0, 0.1);
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0 4px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.2);
}

.empty-cart {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted, #999);
}

.back-to-shop {
  color: var(--accent, #39ff14);
  text-decoration: none;
  font-weight: 700;
  display: inline-block;
  margin-top: 10px;
}

.summary-section {
  border-top: 2px solid rgba(201, 180, 224, 0.1);
  padding-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.95rem;
  color: var(--text, #000);
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.2rem;
  border-top: 1px solid rgba(201, 180, 224, 0.1);
  padding-top: 12px;
  margin-top: 12px;
  color: var(--accent, #39ff14);
}

/* FORM */
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
  color: var(--text, #000);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--text, #000);
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(201, 180, 224, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--text, #000);
  background: var(--bg, #f9f9f9);
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent, #39ff14);
  box-shadow: 0 0 0 2px rgba(57, 255, 20, 0.1);
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
  transition: all 0.3s;
  margin-top: 20px;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 255, 20, 0.3);
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

/* CONFIRMATION MODAL */
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
  padding: 20px;
}

.confirmation-content {
  background: var(--surface, #fff);
  padding: 40px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.confirmation-content h2 {
  font-size: 1.8rem;
  color: var(--accent, #39ff14);
  margin-bottom: 10px;
}

.confirmation-content > p:first-of-type {
  color: var(--muted, #999);
  margin-bottom: 20px;
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
  border-bottom: 1px solid rgba(201, 180, 224, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.confirmation-message {
  color: var(--text, #000);
  margin: 20px 0;
  line-height: 1.6;
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
  transition: all 0.3s;
  margin-top: 20px;
}

.confirmation-btn:hover {
  transform: translateY(-2px);
}
</style>
