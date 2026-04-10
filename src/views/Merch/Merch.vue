<template>
  <main class="merch-page">
    <section class="merch-hero">
      <div class="container">
        <p class="merch-eyebrow">Project Respawn</p>
        <h1>Merch Store</h1>
        <p class="merch-subtitle">
          Browse merch, digital extras, and future custom products in one place.
        </p>
      </div>
    </section>

    <section class="container merch-toolbar">
      <button
        class="filter-btn"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        All
      </button>
      <button
        class="filter-btn"
        :class="{ active: filter === 'printful' }"
        @click="filter = 'printful'"
      >
        Printful
      </button>
      <button
        class="filter-btn"
        :class="{ active: filter === 'manual' }"
        @click="filter = 'manual'"
      >
        Custom
      </button>
    </section>

    <section class="container">
      <p class="merch-status">{{ status }}</p>

      <div v-if="filteredProducts.length" class="product-grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-image-wrap">
            <img
              :src="product.image || fallbackImage"
              :alt="product.title || 'Product image'"
            />
          </div>

          <div class="product-card-content">
            <span class="product-source">{{ product.source || "manual" }}</span>
            <h2 class="product-title">{{ product.title || "Untitled product" }}</h2>
            <p class="product-description">{{ product.description || "No description available." }}</p>
            <div class="product-price">£{{ formatPrice(product.price) }}</div>

            <!-- Updated Product Actions -->
            <div class="product-actions">
              <!-- Size Selector -->
              <div class="size-selector">
                <p class="size-label">Choose Size:</p>
                <div class="size-buttons">
                  <button
                    v-for="size in ['S', 'M', 'L', 'XL', '2XL', '3XL']"
                    :key="size"
                    class="size-btn"
                    :class="{ active: product.selectedSize === size }"
                    @click="selectSize(product, size)"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Quantity + Add to Cart -->
              <div class="quantity-add-section">
                <div class="quantity-control">
                  <button class="qty-btn" @click="decrementQty(product)">–</button>
                  <span class="qty-display">{{ product.selectedQuantity || 1 }}</span>
                  <button class="qty-btn" @click="incrementQty(product)">+</button>
                </div>

                <button class="btn-primary add-to-cart-btn" @click="addToCart(product)">
                  Add to Cart
                </button>
              </div>
            </div>

            <!-- Buy Now + Details -->
            <!-- <div class="product-actions">
              <a
                v-if="product.checkoutUrl"
                class="btn-primary"
                :href="product.checkoutUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to Cart
              </a>

              <a
                v-if="product.productUrl"
                class="btn-secondary"
                :href="product.productUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Details
              </a>
            </div> -->
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        No products found in this section yet.
      </div>
    </section>
  </main>
</template>

<script>
import { fetchProducts } from "./merchService";

export default {
  name: "MerchPage",
  data() {
    return {
      products: [],
      filter: "all",
      status: "Loading products...",
      fallbackImage: "https://via.placeholder.com/600x600?text=Project+Respawn",
    };
  },
  computed: {
    filteredProducts() {
      if (this.filter === "all") return this.products;
      return this.products.filter(
        (product) => (product.source || "").toLowerCase() === this.filter
      );
    },
  },
  async mounted() {
    try {
      const data = await fetchProducts();

      this.products = Array.isArray(data)
        ? data.map((product) => ({
            ...product,
            selectedSize: "",
            selectedQuantity: 1,       
          }))
        : [];

      this.status = `${this.products.length} products loaded`;
    } catch (error) {
      console.error("Merch page error:", error);
      this.status = "Could not load products right now.";
      this.products = [];
    }
  },
  methods: {
    formatPrice(price) {
      const parsed = Number(price);
      return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
    },

    // Size options with full names
    sizes: [
      { value: "S", label: "Small" },
      { value: "M", label: "Medium" },
      { value: "L", label: "Large" },
      { value: "XL", label: "X-Large" },
      { value: "2XL", label: "XX-Large" },
      { value: "3XL", label: "XXX-Large" },
    ],

    selectSize(product, size) {
      product.selectedSize = product.selectedSize === size ? "" : size;
    },

    incrementQty(product) {
      product.selectedQuantity = (product.selectedQuantity || 1) + 1;
    },

    decrementQty(product) {
      if (product.selectedQuantity > 1) {
        product.selectedQuantity--;
      }
    },

    addToCart(product) {
  if (!product.selectedSize) {
    alert("Please select a size");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existing = cart.find(
    (item) => item.id === product.id && item.size === product.selectedSize
  );

  if (existing) {
    existing.qty += product.selectedQuantity || 1;
  } else {
    cart.push({
      ...product,
      size: product.selectedSize,
      qty: product.selectedQuantity || 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Notify header to update count
  window.dispatchEvent(new Event("storage"));

  // Show feedback instead of redirecting
  product.addedToCart = true;
  setTimeout(() => { product.addedToCart = false; }, 2000);
},
  },
};
</script>

<style scoped src="./Merch.css"></style>