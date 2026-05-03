<template>
  <main class="merch-page">
    <!-- Hero Section -->
    <section class="merch-hero">
      <div class="container">
        <p class="merch-eyebrow">Project Respawn</p>
        <h1>Merch Store</h1>
        <p class="merch-subtitle">
          Browse merch, digital extras, and future custom products in one place.
        </p>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="container merch-toolbar">
      <button
        v-for="filter in filters"
        :key="filter"
        class="filter-btn"
        :class="{ active: currentFilter === filter }"
        @click="setFilter(filter)"
      >
        {{ filterLabels[filter] }}
      </button>
    </section>

    <!-- Status Message -->
    <section class="container">
      <p class="merch-status">{{ status }}</p>
    </section>

    <!-- Products Grid -->
    <section class="container">
      <div v-if="filteredProducts.length" class="product-grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <!-- Product Image -->
          <div class="product-image-wrap">
            <img
              :src="product.image"
              :alt="product.title"
              class="product-image"
              @error="(e) => (e.target.src = fallbackImage)"
            />
          </div>

          <!-- Product Content -->
          <div class="product-card-content">
            <span class="product-source" :class="product.source">
              {{ product.source }}
            </span>

            <h2 class="product-title">{{ product.title }}</h2>

            <p class="product-description">
              {{ product.description || 'No description available.' }}
            </p>

            <div class="product-price">
              {{ formatPrice(product.price) }}
            </div>

            <!-- Actions -->
            <div class="product-actions">
              <button
                class="btn-primary"
                @click="addToCart(product)"
              >
                Add to Cart
              </button>
              <a
                v-if="product.productUrl"
                :href="product.productUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-secondary"
              >
                Details
              </a>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        No products found in this section yet.
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchProducts, type Product, type CartItem } from '@/services/merchService';

// ===== STATE =====
const products = ref<Product[]>([]);
const cart = ref<CartItem[]>([]);
const currentFilter = ref<string>('all');
const status = ref<string>('Loading products...');
const isLoading = ref<boolean>(false);

const fallbackImage = 'https://via.placeholder.com/600x600?text=Product+Image';

const filters = ['all', 'printful', 'manual'];
const filterLabels: Record<string, string> = {
  all: 'All Products',
  printful: 'Printful',
  manual: 'Custom/Digital'
};

// ===== COMPUTED =====
const filteredProducts = computed<Product[]>(() => {
  if (currentFilter.value === 'all') {
    return products.value;
  }
  return products.value.filter(
    (product) => product.source.toLowerCase() === currentFilter.value.toLowerCase()
  );
});

// ===== METHODS =====
function setFilter(filter: string) {
  currentFilter.value = filter;
}

function formatPrice(price: number): string {
  if (typeof price !== 'number' || !isFinite(price)) {
    return '£0.00';
  }
  return `£${price.toFixed(2)}`;
}

function addToCart(product: Product) {
  const cartItem: CartItem = {
    id: `${product.id}-${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    variantId: product.variants?.[0]?.id || undefined,
    quantity: 1,
    price: product.price,
    image: product.image
  };

  cart.value.push(cartItem);

  // Emit to parent or use state management
  // For now, dispatch custom event
  window.dispatchEvent(
    new CustomEvent('cart-updated', {
      detail: { cart: cart.value, item: cartItem }
    })
  );

  console.log('Added to cart:', cartItem);
}

async function loadProducts() {
  isLoading.value = true;
  try {
    const data = await fetchProducts();
    products.value = data;
    status.value = `${data.length} products loaded`;
  } catch (error) {
    console.error('Merch page error:', error);
    status.value = 'Could not load products right now. Please try again later.';
  } finally {
    isLoading.value = false;
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.merch-page {
  min-height: 100vh;
  background: var(--bg, #ffffff);
}

.merch-hero {
  padding: 48px 0;
}

.merch-eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.8rem;
  color: var(--accent, #39ff14);
  font-weight: 700;
}

.merch-hero h1 {
  margin: 0 0 16px;
  font-weight: 700;
  color: var(--text, #000);
  font-size: 3rem;
}

.merch-subtitle {
  margin: 0;
  max-width: 56ch;
  color: var(--text, #000);
  font-size: 1.1rem;
}

.merch-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px 0;
}

.filter-btn {
  min-height: 44px;
  padding: 10px 16px;
  border-radius: var(--radius, 8px);
  border: 1px solid rgba(201, 180, 224, 0.1);
  background: rgba(201, 180, 224, 0.05);
  color: var(--text, #000);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: var(--accent, #39ff14);
  background: rgba(57, 255, 20, 0.1);
}

.filter-btn.active {
  background: var(--accent, #39ff14);
  color: var(--bg, #fff);
  border-color: var(--accent, #39ff14);
}

.merch-status {
  color: var(--muted, #999);
  margin: 0 0 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 20px;
  padding-bottom: 48px;
}

.product-card {
  background: var(--surface, #fff);
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: var(--radius, 8px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 16px rgba(97, 0, 224, 0.2);
  transition: all 0.3s ease;
}

.product-card:hover {
  border-color: var(--accent, #39ff14);
  box-shadow: 0 0 24px rgba(57, 255, 20, 0.15);
}

.product-image-wrap {
  aspect-ratio: 1 / 1;
  background: rgba(201, 180, 224, 0.05);
  overflow: hidden;
}

.product-image {
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
  border-radius: var(--radius, 8px);
  background: rgba(57, 255, 20, 0.1);
  color: var(--accent, #39ff14);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.product-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text, #000);
  font-weight: 700;
}

.product-description {
  margin: 0;
  color: var(--muted, #999);
  font-size: 0.9rem;
}

.product-price {
  font-size: 1rem;
  font-weight: 800;
  margin-top: auto;
  color: var(--accent, #39ff14);
}

.product-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius, 8px);
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--accent, #39ff14);
  color: var(--bg, #000);
}

.btn-primary:hover {
  background: var(--accent-2, #31cc0d);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(57, 255, 20, 0.1);
  color: var(--accent, #39ff14);
  border: 1px solid var(--accent, #39ff14);
}

.btn-secondary:hover {
  background: rgba(57, 255, 20, 0.2);
}

.empty-state {
  padding: 32px;
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: var(--radius, 8px);
  background: var(--surface, #fff);
  color: var(--muted, #999);
  margin-bottom: 48px;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
