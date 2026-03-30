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

<style scoped>
.merch-page {
  background: #f6f4ef;
  color: #1f1a17;
  min-height: 100vh;
}

.container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.merch-hero {
  padding: 56px 0 28px;
  border-bottom: 1px solid #ddd6ce;
  background: linear-gradient(180deg, rgba(11, 107, 111, 0.08), rgba(11, 107, 111, 0));
}

.merch-eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.8rem;
  color: #0b6b6f;
  font-weight: 700;
}

.merch-hero h1 {
  margin: 0 0 8px;
  font-size: clamp(2rem, 5vw, 3.4rem);
}

.merch-subtitle {
  margin: 0;
  max-width: 56ch;
  color: #6f6a64;
}

.merch-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px 0 12px;
}

.filter-btn {
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid #ddd6ce;
  background: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.filter-btn.active {
  background: #0b6b6f;
  color: white;
  border-color: #0b6b6f;
}

.merch-status {
  color: #6f6a64;
  margin: 0 0 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 20px;
  padding-bottom: 48px;
}

.product-card {
  background: #ffffff;
  border: 1px solid #ddd6ce;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(24, 19, 16, 0.08);
}

.product-image-wrap {
  aspect-ratio: 1 / 1;
  background: #f1ede7;
}

.product-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  flex: 1;
}

.product-source {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(11, 107, 111, 0.08);
  color: #0b6b6f;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.product-title {
  margin: 0;
  font-size: 1.1rem;
}

.product-description {
  margin: 0;
  color: #6f6a64;
}

.product-price {
  font-size: 1rem;
  font-weight: 800;
  margin-top: auto;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.product-actions a {
  flex: 1;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
}

.btn-primary {
  background: #0b6b6f;
  color: white;
}

.btn-secondary {
  background: #f1ede7;
  color: #1f1a17;
  border: 1px solid #ddd6ce;
}

.empty-state {
  padding: 32px;
  border: 1px solid #ddd6ce;
  border-radius: 18px;
  background: #ffffff;
  color: #6f6a64;
  margin-bottom: 48px;
}
</style>
