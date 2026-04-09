<template>
  <div class="checkout-page">
    <!-- Header -->
    <header class="checkout-header">
      <h1>Checkout</h1>
      <button @click="goBack" class="back-btn">← Back to Store</button>
    </header>

    <!-- Cart Items -->
    <section class="cart-items-section" v-if="cartProducts.length">
      <h2>Your Cart</h2>

      <div class="cart-items">
        <div
          class="cart-item"
          v-for="product in cartProducts"
          :key="product.id"
        >
          <img
            :src="product.image"
            :alt="product.title"
            class="cart-item-img"
          />
          <div class="cart-item-info">
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <p>Price: £{{ product.price.toFixed(2) }}</p>

            <div class="quantity-control">
              <button @click="decreaseQty(product)">-</button>
              <span>{{ product.qty }}</span>
              <button @click="increaseQty(product)">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>£{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>£{{ shipping.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>£{{ total.toFixed(2) }}</span>
        </div>
      </div>
    </section>

    <section v-else class="empty-cart">
      <p>Your cart is empty. Go back and add some products!</p>
      <button @click="goBack" class="back-btn">← Back to Store</button>
    </section>

    <!-- Customer Details Form -->
    <section v-if="cartProducts.length" class="checkout-form-section">
      <h2>Delivery Details</h2>
      <form @submit.prevent="submitOrder" class="customer-form">
        <div class="form-group">
          <label for="name">Full Name *</label>
          <input id="name" v-model="customer.name" type="text" required />
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
        <div class="form-group">
          <label for="city">City *</label>
          <input id="city" v-model="customer.city" type="text" required />
        </div>
        <div class="form-group">
          <label for="postcode">Postcode *</label>
          <input
            id="postcode"
            v-model="customer.postcode"
            type="text"
            required
          />
        </div>

        <button type="submit" class="payment-btn">
          Complete Payment
        </button>
      </form>
    </section>

    <!-- Order Confirmation -->
    <section v-if="orderConfirmed" class="confirmation">
      <h2>✅ Order Confirmed!</h2>
      <p>Thank you for your purchase, {{ customer.name }}.</p>
      <p>
        Order ID: <strong>{{ orderId }}</strong>
      </p>
      <p>Your order will be shipped within 3-5 business days.</p>
      <button @click="goBack" class="back-btn">Continue Shopping</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { fetchProducts, type Product } from "../Merch/merchService";

interface CartProduct extends Product {
  qty: number;
}

const cartProducts = ref<CartProduct[]>([]);
const shipping = ref(5);

const customer = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postcode: "",
});

const orderConfirmed = ref(false);
const orderId = ref("");

const subtotal = computed(() =>
  cartProducts.value.reduce((acc, p) => acc + p.price * p.qty, 0)
);
const total = computed(() => subtotal.value + shipping.value);

function increaseQty(product: CartProduct) {
  product.qty++;
}
function decreaseQty(product: CartProduct) {
  if (product.qty > 1) product.qty--;
}

function goBack() {
  window.history.back();
}

function submitOrder() {
  orderConfirmed.value = true;
  orderId.value = "ORD-" + Math.floor(Math.random() * 1000000);
  console.log("Order details:", { customer, cartProducts });
}

onMounted(async () => {
  // Load products (simulate selected products in cart)
  try {
    const products = await fetchProducts();
    // For demo, take first 2 products
    cartProducts.value = products.slice(0, 2).map((p) => ({ ...p, qty: 1 }));
  } catch (err) {
    console.error(err);
  }
});
</script>

<style scoped>
.checkout-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, sans-serif;
}

/* Header */
.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.back-btn {
  background: none;
  border: none;
  color: #3498db;
  font-size: 16px;
  cursor: pointer;
}
.back-btn:hover {
  text-decoration: underline;
}

/* Cart Items */
.cart-items-section h2 {
  margin-bottom: 15px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  gap: 15px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
}
.cart-item-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 5px;
}
.cart-item-info h3 {
  margin: 0 0 5px 0;
}
.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.quantity-control button {
  width: 30px;
  height: 30px;
  font-size: 18px;
  border: 1px solid #ccc;
  background: #27ae60;
  cursor: pointer;
  border-radius: 4px;
}
.quantity-control span {
  width: 20px;
  text-align: center;
}

/* Cart summary */
.cart-summary {
  border-top: 1px solid #ddd;
  padding-top: 10px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-weight: bold;
}
.summary-row.total {
  font-size: 18px;
  color: #27ae60;
}

/* Form */
.customer-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}
.customer-form .form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}
.customer-form .form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.payment-btn {
  background-color: #27ae60;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.payment-btn:hover {
  background-color: #229954;
}

/* Confirmation */
.confirmation {
  text-align: center;
  padding: 20px;
  margin-top: 20px;
}
</style>
