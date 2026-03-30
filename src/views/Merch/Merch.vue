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
            <img :src="product.image" :alt="product.title" />
          </div>

          <div class="product-card-content">
            <span class="product-source">{{ product.source }}</span>
            <h2 class="product-title">{{ product.title }}</h2>
            <p class="product-description">
              {{ product.description || 'No description available.' }}
            </p>
            <div class="product-price">£{{ formatPrice(product.price) }}</div>

            <div class="product-actions">
              <a class="btn-primary" :href="product.checkoutUrl || '#'">Buy now</a>
              <a class="btn-secondary" :href="product.productUrl || '#'">Details</a>
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
      status: "Loading products..."
    };
  },
  computed: {
    filteredProducts() {
      if (this.filter === "all") {
        return this.products;
      }

      return this.products.filter((product) => product.source === this.filter);
    }
  },
  async mounted() {
    try {
      const data = await fetchProducts();
      this.products = data;
      this.status = `${data.length} products loaded`;
    } catch (error) {
      console.error(error);
      this.status = "Could not load products right now.";
    }
  },
  methods: {
    formatPrice(price) {
      return Number(price || 0).toFixed(2);
    }
  }
};
</script>

<style scoped src="./Merch.css"></style>  