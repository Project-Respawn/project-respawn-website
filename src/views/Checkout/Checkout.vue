<template>
  <main class="checkout-container">
    <header class="checkout-header">
      <button class="back-btn" @click="goBack">← Back to Shop</button>
      <h1>Checkout</h1>
    </header>

    <div class="checkout-wrapper">
      <section class="order-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Total:</span>
          <span>{{ formatPrice(total) }}</span>
        </div>
      </section>

      <section class="checkout-form-section">
        <form @submit.prevent="handleCheckout">
          <div class="form-group">
            abel>Full Name</label>
            <input v-model="formData.fullName" type="text" />
          </div>

          <div class="form-group">
            abel>Email</label>
            <input v-model="formData.email" type="email" />
          </div>

          <div class="form-group">
            abel>Phone</label>
            <input v-model="formData.phone" type="tel" />
          </div>

          <div class="form-group">
            abel>Address</label>
            <input v-model="formData.address" type="text" />
          </div>

          <div class="form-group">
            abel>City</label>
            <input v-model="formData.city" type="text" />
          </div>

          <div class="form-group">
            abel>Postcode</label>
            <input v-model="formData.postcode" type="text" />
          </div>

          <button type="submit" class="checkout-btn">Complete Purchase</button>
        </form>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="showConfirmation" class="confirmation-message">Order confirmed!</div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createRevolutOrder, createPrintfulOrder, type CartItem } from '@/services/merchService';

const router = useRouter();
const error = ref('');
const showConfirmation = ref(false);
const total = ref(0);

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

function formatPrice(price: number): string {
  if (typeof price !== 'number' || !isFinite(price)) {
    return '£0.00';
  }
  return `£${price.toFixed(2)}`;
}

function goBack() {
  router.push('/merch');
}

async function handleCheckout() {
  error.value = '';
  try {
    if (!formData.value.fullName || !formData.value.email) {
      throw new Error('Please fill in all fields');
    }

    const revolutOrder = await createRevolutOrder({
      amount: total.value,
      currency: 'GBP',
      description: 'Project Respawn Merch',
      customerId: `cust-${Date.now()}`
    });

    showConfirmation.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error occurred';
  }
}
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.checkout-header {
  margin-bottom: 40px;
}

.checkout-header h1 {
  font-size: 2rem;
  margin-top: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--accent, #39ff14);
  cursor: pointer;
  font-weight: bold;
}

.checkout-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

@media (max-width: 900px) {
  .checkout-wrapper {
    grid-template-columns: 1fr;
  }
}

.order-summary {
  background: white;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.checkout-form-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent, #39ff14);
  color: #000;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.error-message {
  color: red;
  margin-top: 20px;
  padding: 10px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
}

.confirmation-message {
  color: green;
  margin-top: 20px;
  padding: 10px;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 4px;
}
</style>
