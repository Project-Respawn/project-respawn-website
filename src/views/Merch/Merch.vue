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
            <span class="product-source">{{ product.source || 'manual' }}</span>
            <h2 class="product-title">{{ product.title || 'Untitled product' }}</h2>

            <p class="product-description">
              {{ product.description || 'No description available.' }}
            </p>

            <div class="product-price">£{{ formatPrice(product.price) }}</div>

            <div class="product-actions">
              <a
                v-if="product.checkoutUrl"
                class="btn-primary"
                :href="product.checkoutUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy now
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
            </div>
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
      fallbackImage: "https://via.placeholder.com/600x600?text=Project+Respawn"
    };
  },
  computed: {
    filteredProducts() {
      if (this.filter === "all") {
        return this.products;
      }
      return this.products.filter(
        (product) => (product.source || "").toLowerCase() === this.filter
      );
    }
  },
  async mounted() {
    try {
      const data = await fetchProducts();

      this.products = Array.isArray(data)
        ? data.map((product, index) => ({
            id: product.id || `product-${index}`,
            title: product.title || "Untitled product",
            description: product.description || "",
            image: product.image || "",
            source: (product.source || "manual").toLowerCase(),
            price: product.price ?? 0,
            checkoutUrl: product.checkoutUrl || "",
            productUrl: product.productUrl || ""
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
    }
  }
};
</script>

<style scoped src="./Merch.css"></style>
