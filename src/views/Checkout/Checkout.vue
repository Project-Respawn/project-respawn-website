<template>
  <div class="checkout-page">
    <!-- Header -->
    <header class="checkout-header">
      <h1>Checkout</h1>
      <button @click="goBack" class="back-btn">← Back to Store</button>
    </header>

    <!-- Main Layout: Two Columns -->
    <div class="checkout-layout" v-if="cartProducts.length">
      <!-- Left: Cart Products -->
      <div class="cart-section">
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
              <p v-if="product.size" class="product-size">
                Size: <strong>{{ product.size }}</strong>
              </p>
              <div class="product-controls">
                <div class="quantity-control">
                  <button @click="decreaseQty(product)">-</button>
                  <span>{{ product.qty }}</span>
                  <button @click="increaseQty(product)">+</button>
                </div>
                <button
                  @click="removeItem(product)"
                  class="remove-btn"
                  title="Remove item"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Price Summary and Checkout Details -->
      <div class="checkout-section">
        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>£{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
           <span style="text-decoration: line-through;">£5.00</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>£{{ total.toFixed(2) }}</span>
          </div>
        </div>

        <section class="checkout-form-section">
          <h3>Delivery Details</h3>
          <form @submit.prevent="submitOrder" class="customer-form">
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input id="name" v-model="customer.name" type="text" required />
            </div>
            <div class="form-group">
              <label for="email">Email Address *</label>
              <input
                id="email"
                v-model="customer.email"
                type="email"
                required
              />
            </div>
            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <input id="phone" v-model="customer.phone" type="tel" required />
            </div>
            <div class="form-group">
              <label for="address">Street Address *</label>
              <input
                id="address"
                v-model="customer.address"
                type="text"
                required
              />
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
      </div>
    </div>

    <section v-else class="empty-cart">
      <p>Your cart is empty. Go back and add some products!</p>
      <button @click="goBack" class="back-btn">← Back to Store</button>
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
  size?: string;
}

const cartProducts = ref<CartProduct[]>([]);
const shipping = ref(0);

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
  localStorage.setItem("cart", JSON.stringify(cartProducts.value));
  window.dispatchEvent(new Event("storage"));
}

function decreaseQty(product: CartProduct) {
  if (product.qty > 1) product.qty--;
  localStorage.setItem("cart", JSON.stringify(cartProducts.value));
  window.dispatchEvent(new Event("storage"));
}

function removeItem(product: CartProduct) {
  cartProducts.value = cartProducts.value.filter(
    (p) => !(p.id === product.id && p.size === product.size)
  );
  localStorage.setItem("cart", JSON.stringify(cartProducts.value));
  window.dispatchEvent(new Event("storage"));
}

function goBack() {
  window.history.back();
}

async function submitOrder() {
  try {
    localStorage.setItem("customerDetails", JSON.stringify(customer));

    const res = await fetch("https://raven-api-nine.vercel.app/api/revolut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total.value,
        currency: "GBP",
        description: `Order for ${customer.name}`,
        customer_email: customer.email,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Clear cart before redirecting
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("storage")); // updates header badge to 0

    window.location.href = `https://checkout.revolut.com/payment-link/${data.publicId}`;

  } catch (err: any) {
    console.error("Payment failed:", err);
    alert(`Payment failed: ${err.message}`);
  }
}

onMounted(() => {
  // Load cart
  const stored = localStorage.getItem("cart");
  if (stored) cartProducts.value = JSON.parse(stored);

  // Autofill customer details
  const saved = localStorage.getItem("customerDetails");
  if (saved) Object.assign(customer, JSON.parse(saved));
});
</script>

<style scoped>
.checkout-page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 20px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
}

/* Header */
.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.checkout-header h1 {
  color: white;
  font-size: 28px;
  margin: 0;
}
.back-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.back-btn:hover {
  color: var(--accent-2);
  text-decoration: underline;
}

/* Main Layout */
.checkout-layout {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  align-items: flex-start;
}

.cart-section {
  flex: 0 0 520px;
  max-width: 520px;
  min-width: 320px;
  background: var(--surface);
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: var(--radius);
  padding: 20px;
}

.checkout-section {
  flex: 1;
  min-width: 320px;
  background: var(--surface);
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: var(--radius);
  padding: 20px;
}

/* Cart Items */
.cart-section h2 {
  margin-bottom: 20px;
  color: var(--text);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  gap: 15px;
  background: transparent;
  border: 1px solid rgba(201, 180, 224, 0.25);
  padding: 15px;
  border-radius: 8px;
  align-items: center;
}
.cart-item-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 5px;
}
.cart-item-info h3 {
  margin: 0 0 5px 0;
  color: white;
  font-size: 22px;
}
.cart-item-info p {
  margin: 0 0 5px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}
.product-size {
  color: var(--accent);
  font-size: 14px;
}
.product-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}
.quantity-control {
  display: flex;
  align-items: center;
  border: 2px solid #555;
  border-radius: 9999px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.3);
  width: fit-content;
}
.quantity-control button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-control span {
  min-width: 40px;
  text-align: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

/* Cart Summary */
.cart-summary {
  margin-bottom: 30px;
}

.cart-section h2 {
  margin-bottom: 20px;
  color: white;
}

.cart-summary h3 {
  margin-bottom: 15px;
  color: white;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.85);
}
.customer-form .form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.85);
  display: block;
}
.summary-row.total {
  font-size: 18px;
  color: var(--accent);
  font-weight: bold;
  border-top: 1px solid rgba(201, 180, 224, 0.2);
  padding-top: 10px;
}

/* Form */
.checkout-form-section h3 {
  margin-bottom: 20px;
  color: white;
}
.customer-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.customer-form .form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: white;
}
.customer-form .form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid rgba(201, 180, 224, 0.2);
  border-radius: 8px;
  background: var(--bg2);
  color: white;
  transition: border-color 0.3s ease;
}
.customer-form .form-group input:focus {
  border-color: var(--accent);
  outline: none;
}
.payment-btn {
  width: 100%;
  background: var(--accent);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  letter-spacing: 0.03em;
}
.payment-btn:hover {
  opacity: 0.85;
  background: var(--accent);
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 40px;
  background: var(--surface);
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: var(--radius);
}
.empty-cart p {
  color: var(--text);
  margin-bottom: 20px;
}

/* Confirmation */
.confirmation {
  text-align: center;
  padding: 40px;
  background: var(--surface);
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: var(--radius);
}
.confirmation h2 {
  color: var(--accent);
  margin-bottom: 15px;
}
.confirmation p {
  color: var(--text);
  margin-bottom: 10px;
}

.remove-btn {
  background: none;
  border: 1px solid rgba(255, 80, 80, 0.5);
  color: #ff5050;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}
.remove-btn:hover {
  background: rgba(255, 80, 80, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .checkout-layout {
    flex-direction: column;
  }
  .cart-section,
  .checkout-section {
    flex: none;
  }
}
</style>
