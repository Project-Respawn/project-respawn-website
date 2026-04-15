<template>
  <main class="merch-page">
    <!-- HERO -->
    <section class="merch-hero">
      <div class="container">
        <p class="merch-eyebrow">Project Respawn</p>
        <h1>Merch Store</h1>
        <p class="merch-subtitle">
          Browse merch, digital extras, and future custom products in one place.
        </p>
      </div>
    </section>

    <!-- FILTER -->
    <section class="container merch-toolbar">
      <button class="filter-btn" :class="{ active: filter === 'all' }" @click="filter='all'">All</button>
      <button class="filter-btn" :class="{ active: filter === 'printful' }" @click="filter='printful'">Printful</button>
      <button class="filter-btn" :class="{ active: filter === 'manual' }" @click="filter='manual'">Custom</button>
    </section>

    <!-- PRODUCTS -->
    <section class="container">
      <p class="merch-status">{{ status }}</p>

      <div v-if="filteredProducts.length" class="product-grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
          @click="openModal(product)"
        >
          <div class="product-image-wrap">
           <img :src="product.image || fallbackImage" />
          </div>

          <div class="product-card-content">
            <span class="product-source">{{ product.source }}</span>
            <h2 class="product-title">{{ product.title }}</h2>
            <div class="product-price">£{{ formatPrice(product.price) }}</div>
          </div>
        </article>
      </div>
    </section>

    <!-- MODAL -->
    <div v-if="activeProduct" class="merch-modal-overlay" @click.self="closeModal">
      <div class="merch-modal">

        <button class="close-btn" @click="closeModal">✕</button>

        <div class="merch-modal-body">
          <!-- IMAGE -->
          <div class="merch-modal-left">
            <img :src="selectedVariantImage || activeProduct.image" />

            <!-- COLOR VARIANTS (below image) -->
            <div class="variant-grid" v-if="colors.length">
              <div
                v-for="c in colors"
                :key="c.key"
                class="variant-tile"
                :class="{ active: selectedColorKey === c.key }"
                @click.stop="selectColor(c.key)"
                :title="c.key"
              >
                <img :src="c.thumb" :alt="c.key" />
              </div>
            </div>
          </div>

          <!-- DETAILS -->
          <div class="merch-modal-right">
            <h2>{{ activeProduct.title }}</h2>
            <p v-if="activeProduct.description" class="product-description">
              {{ activeProduct.description }}
            </p>
            <p class="price">£{{ formatPrice(activeProduct.price) }}</p>

            <!-- SIZE -->
            <div class="size-section" v-if="sizesForSelectedColor.length">
              <p class="my-4">Select Size</p>
              <div class="sizes">
                <button
                  v-for="size in sizesForSelectedColor"
                  :key="size"
                  :class="{ active: selectedSize === size }"
                  @click.stop="selectSize(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- QUANTITY -->
            <div class="qty my-3">
              <button @click="decrementQty">–</button>
              <span class="mt-2">{{ quantity }}</span>
              <button @click="incrementQty">+</button>
            </div>

            <!-- ADD -->
            <button class="add-btn my-4" @click="handleAddToCart">
              Add to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script>
import { fetchProducts } from "./merchService";

export default {
  data() {
    return {
      products: [],
      filter: "all",
      status: "Loading...",
      fallbackImage: "https://via.placeholder.com/600",

      // MODAL STATE
      activeProduct: null,
      selectedColorKey: "",
      selectedVariant: null,
      selectedSize: "",
      quantity: 1,
    };
  },

  computed: {
    filteredProducts() {
      if (this.filter === "all") return this.products;
      return this.products.filter(
        (p) => (p.source || "").toLowerCase() === this.filter
      );
    },

    selectedVariantImage() {
      return this.selectedVariant?.image || this.activeProduct?.image;
    },

    variantMeta() {
      const variants = this.activeProduct?.variants || [];
      const meta = variants.map((v) => {
        const parsed = this.parseVariantName(v?.name);
        return {
          raw: v,
          id: v?.id,
          color: parsed.color,
          size: parsed.size,
          image: this.variantPreviewUrl(v),
        };
      });

      // Only keep entries that have at least a color or size; avoid totally empty names.
      return meta.filter((m) => m.color || m.size);
    },

    colors() {
      const byColor = new Map();
      for (const m of this.variantMeta) {
        const key = m.color || "Unknown";
        if (!byColor.has(key)) byColor.set(key, []);
        byColor.get(key).push(m);
      }
      return Array.from(byColor.entries()).map(([key, entries]) => {
        const thumb =
          entries.find((e) => e.image)?.image ||
          this.activeProduct?.image ||
          this.fallbackImage;
        return { key, thumb, entries };
      });
    },

    sizesForSelectedColor() {
      const colorKey = this.selectedColorKey || (this.colors[0]?.key ?? "");
      const entries = this.colors.find((c) => c.key === colorKey)?.entries || [];
      const set = new Set(entries.map((e) => e.size).filter(Boolean));

      const arr = Array.from(set);
      // Friendly ordering for common apparel sizes
      const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
      arr.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      return arr;
    },
  },

  async mounted() {
    const data = await fetchProducts();
    this.products = data || [];
    this.status = `${this.products.length} products loaded`;
  },

  methods: {
    formatPrice(p) {
      return Number(p || 0).toFixed(2);
    },

    parseVariantName(name) {
      const raw = String(name || "").trim();
      if (!raw) return { color: "Unknown", size: "" };

      // Common Printful pattern: "Color / Size" (sometimes more segments)
      if (raw.includes(" / ")) {
        const parts = raw.split(" / ").map((p) => p.trim()).filter(Boolean);
        // Printful often includes the product name first:
        // "Product name / Color / Size"
        if (parts.length >= 3) {
          return {
            color: parts[1] || "Unknown",
            size: parts[2] || "",
          };
        }
        return {
          color: parts[0] || "Unknown",
          size: parts[1] || "",
        };
      }

      // Fallback: try last token as size if it matches common apparel sizes
      const tokens = raw.split(/\s+/).filter(Boolean);
      const last = tokens[tokens.length - 1] || "";
      const sizePattern = /^(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)$/i;
      if (sizePattern.test(last)) {
        const normalized = last.toUpperCase() === "XXL" ? "2XL" : last.toUpperCase();
        return { color: tokens.slice(0, -1).join(" ") || "Unknown", size: normalized };
      }

      return { color: raw || "Unknown", size: "" };
    },

    variantPreviewUrl(variant) {
      const files = Array.isArray(variant?.files) ? variant.files : [];
      const preferred =
        files.find((f) => f?.type === "preview" && f?.preview_url) ||
        files.find((f) => f?.type === "front_large" && f?.preview_url) ||
        files.find((f) => f?.preview_url) ||
        files[0];
      return preferred?.preview_url || "";
    },

    resolveSelectedVariant() {
      if (!this.activeProduct) return;
      const colorKey = this.selectedColorKey || (this.colors[0]?.key ?? "");
      const size = this.selectedSize || "";

      const entries = this.colors.find((c) => c.key === colorKey)?.entries || [];

      // Prefer exact size match; otherwise fallback to first entry.
      const chosen =
        (size && entries.find((e) => e.size === size)) ||
        entries.find((e) => e.size) ||
        entries[0] ||
        null;

      this.selectedVariant = chosen
        ? {
            id: chosen.id,
            name: chosen.raw?.name,
            files: chosen.raw?.files || [],
            image: chosen.image || this.activeProduct.image,
            color: chosen.color || colorKey,
            size: chosen.size || size,
          }
        : null;
    },

    selectColor(colorKey) {
      this.selectedColorKey = colorKey;
      const sizes = this.sizesForSelectedColor;
      if (!sizes.includes(this.selectedSize)) {
        this.selectedSize = sizes[0] || "";
      }
      this.resolveSelectedVariant();
    },

    selectSize(size) {
      this.selectedSize = size;
      this.resolveSelectedVariant();
    },

    openModal(product) {
      const variants = Array.isArray(product.variants) ? product.variants : [];

      this.activeProduct = {
        ...product,
        variants,
      };

      // Initialize selection from first available color/size
      this.selectedColorKey = this.colors[0]?.key || "Unknown";
      this.selectedSize = this.sizesForSelectedColor[0] || "";
      this.quantity = 1;
      this.resolveSelectedVariant();
    },

    closeModal() {
      this.activeProduct = null;
    },

    selectVariant(v) {
      // Back-compat: if anything still calls this with a meta-like object
      if (!v) return;
      if (typeof v === "string") {
        this.selectColor(v);
        return;
      }
      if (v.color) this.selectedColorKey = v.color;
      if (v.size) this.selectedSize = v.size;
      this.resolveSelectedVariant();
    },

    incrementQty() {
      this.quantity++;
    },

    decrementQty() {
      if (this.quantity > 1) this.quantity--;
    },

    handleAddToCart() {
      if (!this.selectedSize) {
        alert("Select size");
        return;
      }
      if (!this.selectedVariant?.id) {
        alert("Select a colour/variant");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const item = {
        id: this.activeProduct.id,
        title: this.activeProduct.title,
        image: this.selectedVariantImage || this.activeProduct.image,
        price: this.activeProduct.price,
        size: this.selectedSize,
        variantId: this.selectedVariant?.id,
        color: this.selectedVariant?.color || this.selectedColorKey || "Unknown",
        qty: this.quantity,
      };

      const existing = cart.find(
        (i) =>
          i.id === item.id &&
          i.size === item.size &&
          i.variantId === item.variantId
      );

      if (existing) {
        existing.qty += item.qty;
      } else {
        cart.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));

      // CLOSE MODAL AFTER ADD
      this.closeModal();
    },
  },
};
</script>

<style scoped src="./Merch.css"></style>