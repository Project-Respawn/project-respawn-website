<template>
  <main class="checkout">
    <header>
      <button @click="goBack">← Back</button>
      <h1>Checkout</h1>
    </header>

    <div class="content">
      <aside class="summary">
        <h2>Order Total</h2>
        <p>{{ formatPrice(total) }}</p>
      </aside>

      <section class="form-area">
        <form @submit.prevent="checkout">
          <input v-model="name" type="text" placeholder="Name" />
          <input v-model="email" type="email" placeholder="Email" />
          <input v-model="address" type="text" placeholder="Address" />
          <button type="submit">Pay Now</button>
        </form>
        <p v-if="message" class="msg">{{ message }}</p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const email = ref('');
const address = ref('');
const message = ref('');
const total = ref(0);

function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

function goBack() {
  router.push('/merch');
}

async function checkout() {
  message.value = 'Processing...';
  try {
    // TODO: Add payment processing
    message.value = 'Order confirmed!';
  } catch (error) {
    message.value = 'Error occurred';
  }
}
</script>

<style scoped>
.checkout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

header {
  margin-bottom: 40px;
}

header button {
  background: none;
  border: none;
  color: var(--accent, #39ff14);
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 20px;
}

header h1 {
  font-size: 2rem;
  margin: 0;
}

.content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
}

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: fit-content;
}

.form-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button[type="submit"] {
  padding: 12px;
  background: var(--accent, #39ff14);
  color: #000;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.msg {
  margin-top: 15px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
}
</style>
