<template>
  <main class="container py-5">
    <section>
        <!-- Header -->
        <header class="header">
            <h1>Merch</h1>
            <button class="cart-button" onclick="toggleCart()">
                🛒 Cart (<span id="cart-count">0</span>)
            </button>
        </header>

        <!-- Main Content -->
        <main>
            <!-- Products Section -->
            <section class="products-section">
                <h2>Our Products</h2>
                <div id="products-container" class="products-grid">
                    <!-- Products load here -->
                    <div class="loading">Loading products...</div>
                </div>
            </section>

            <!-- Shopping Cart Sidebar -->
            <aside id="cart-sidebar" class="cart-sidebar hidden">
                <div class="cart-header">
                    <h2>Your Cart</h2>
                    <button onclick="toggleCart()" class="close-btn">✕</button>
                </div>
                
                <div id="cart-items" class="cart-items">
                    <p class="empty-message">Your cart is empty</p>
                </div>

                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>£<span id="subtotal">0.00</span></span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>£<span id="shipping">5.00</span></span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>£<span id="total">5.00</span></span>
                    </div>
                </div>

                <button id="checkout-btn" class="checkout-btn" onclick="proceedToCheckout()" disabled>
                    Proceed to Checkout
                </button>
            </aside>

            <!-- Checkout Section -->
            <div id="checkout-section" class="checkout-section hidden">
                <div class="checkout-container">
                    <button onclick="backToCart()" class="back-btn">← Back to Cart</button>
                    
                    <h2>Checkout</h2>

                    <!-- Customer Details Form -->
                    <form id="customer-form" class="customer-form">
                        <h3>Delivery Details</h3>
                        
                        <div class="form-group">
                            <label for="full-name">Full Name *</label>
                            <input type="text" id="full-name" required>
                        </div>

                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" required>
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" required>
                        </div>

                        <div class="form-group">
                            <label for="address">Street Address *</label>
                            <input type="text" id="address" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City *</label>
                                <input type="text" id="city" required>
                            </div>
                            <div class="form-group">
                                <label for="postcode">Postcode *</label>
                                <input type="text" id="postcode" required>
                            </div>
                        </div>

                        <h3>Payment Method</h3>
                        <!-- Revolut Embedded Checkout -->
                        <div id="revolut-checkout"></div>
                        
                        <button type="submit" class="payment-btn">Complete Payment</button>
                    </form>

                    <!-- Order Confirmation -->
                    <div id="confirmation" class="confirmation hidden">
                        <h3>✅ Order Confirmed!</h3>
                        <p>Thank you for your purchase.</p>
                        <p>Order ID: <strong id="order-id"></strong></p>
                        <p>Your order will be printed and shipped within 3-5 business days.</p>
                        <button onclick="location.reload()">Continue Shopping</button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <!-- <footer class="footer">
            <p>&copy; 2026 My Print Store. All rights reserved.</p>
        </footer> -->

    </section>
  </main>
</template>

<script setup>
  import { onMounted } from 'vue'

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  onMounted(async () => {
    // await loadScript("https://sdk.revolut.com/embedded-checkout/embedded-checkout-sdk.js");    
    await loadScript("https://merchant.revolut.com/embed.js");
  })
</script>


<style scoped>
</style>

<!-- <style scoped src="./Merch.css"></style> -->