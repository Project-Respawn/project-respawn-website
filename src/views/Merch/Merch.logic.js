import { nextTick } from 'vue';
import { generateClient } from 'aws-amplify/data';
import { fetchProducts, fetchProductById } from './merchService';

function getClient() {
  return generateClient();
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function titleCase(value) {
  const text = normalizeText(value);
  if (!text) return '';
  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function inferPriceNumber(...values) {
  for (const value of values) {
    if (value == null) continue;

    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.]/g, '');
      const cleanedNumber = Number(cleaned);
      if (Number.isFinite(cleanedNumber) && cleanedNumber > 0) {
        return cleanedNumber;
      }
    }
  }

  return null;
}

function formatPrice(price, currency = 'GBP') {
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) {
    return 'Price unavailable';
  }
  return `${currency} ${numeric.toFixed(2)}`;
}

function getProductArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.body?.products)) return payload.body.products;
  if (Array.isArray(payload?.body?.result)) return payload.body.result;
  return [];
}

function inferTitle(product, index = 0) {
  return firstNonEmpty(
    product?.name,
    product?.title,
    product?.sync_product?.name,
    product?.sync_product?.title,
    `Untitled product ${index + 1}`
  );
}

function inferDescription(product) {
  return firstNonEmpty(
    product?.description,
    product?.summary,
    product?.sync_product?.description
  );
}

function inferImage(product) {
  return firstNonEmpty(
    product?.thumbnail_url,
    product?.thumbnailUrl,
    product?.image,
    product?.imageUrl,
    product?.sync_product?.thumbnail_url,
    product?.sync_product?.thumbnail,
    product?.sync_product?.image
  );
}

function inferProductUrl(product) {
  return firstNonEmpty(
    product?.productUrl,
    product?.product_url,
    product?.url,
    product?.sync_product?.url
  );
}

function inferVariantCount(product) {
  if (Array.isArray(product?.sync_variants)) {
    return product.sync_variants.length;
  }
  if (Array.isArray(product?.variants)) {
    return product.variants.length;
  }
  if (Number.isFinite(Number(product?.variantCount))) {
    return Number(product.variantCount);
  }
  if (Number.isFinite(Number(product?.variant_count))) {
    return Number(product.variant_count);
  }
  return 0;
}

function inferCategory(product) {
  return firstNonEmpty(
    product?.category,
    product?.categoryName,
    product?.type,
    product?.product_type,
    product?.sync_product?.category,
    product?.sync_product?.type
  );
}

function inferBrand(product) {
  return firstNonEmpty(
    product?.brand,
    product?.brandName,
    product?.brand_name,
    product?.sync_product?.brand,
    product?.sync_product?.manufacturer
  );
}

function getRawVariants(product) {
  if (Array.isArray(product?.sync_variants)) {
    return product.sync_variants;
  }
  if (Array.isArray(product?.variants)) {
    return product.variants;
  }
  return [];
}

function inferDisplayPriceFromPrintful(product) {
  const variants = getRawVariants(product);

  const prices = variants
    .map((variant) =>
      inferPriceNumber(
        variant?.retail_price,
        variant?.retailPrice,
        variant?.price,
        variant?.sync_variant?.retail_price
      )
    )
    .filter((price) => price != null);

  if (!prices.length) {
    return 'Price unavailable';
  }

  return formatPrice(Math.min(...prices), 'GBP');
}

function mapAvailabilityStatus(variant) {
  const rawStatus = firstNonEmpty(
    variant?.availabilityStatus,
    variant?.availability,
    variant?.availability_status
  ).toLowerCase();

  if (variant?.in_stock === true) return 'In stock';
  if (rawStatus === 'active') return 'In stock';
  if (rawStatus === 'in stock') return 'In stock';
  if (rawStatus === 'in_stock') return 'In stock';
  if (rawStatus === 'out of stock') return 'Out of stock';
  if (rawStatus === 'out_of_stock') return 'Out of stock';
  if (rawStatus === 'sold out') return 'Out of stock';

  return 'Availability unknown';
}

function normalizeVariant(variant) {
  const retailPrice = inferPriceNumber(
    variant?.retail_price,
    variant?.retailPrice,
    variant?.price,
    variant?.sync_variant?.retail_price
  );

  return {
    id: variant?.id || '',
    name: firstNonEmpty(variant?.name, variant?.title),
    color: titleCase(firstNonEmpty(variant?.color, variant?.colour)),
    size: firstNonEmpty(variant?.size),
    image: firstNonEmpty(
      variant?.image,
      variant?.imageUrl,
      variant?.image_url,
      variant?.files?.[0]?.preview_url,
      variant?.files?.[0]?.url
    ),
    currency: firstNonEmpty(variant?.currency, 'GBP'),
    retailPrice,
    availabilityStatus: mapAvailabilityStatus(variant),
  };
}

function normalizeStoredProduct(product, productBrands = [], productCategories = []) {
  const fallbackNumericPrice = inferPriceNumber(
    product?.price,
    product?.retailPrice,
    product?.retail_price
  );

  const normalizedBrands = [
    ...new Set(productBrands.map((value) => titleCase(value)).filter(Boolean)),
  ];

  const normalizedCategories = [
    ...new Set(productCategories.map((value) => titleCase(value)).filter(Boolean)),
  ];

  return {
    id: product.id,
    internalId: product.id,
    title: normalizeText(product.title) || 'Untitled product',
    description: normalizeText(product.description),
    image: normalizeText(product.imageUrl),
    brand: normalizedBrands[0] || '',
    brands: normalizedBrands,
    category: normalizedCategories[0] || '',
    categories: normalizedCategories,
    sourceType: normalizeText(product.sourceType),
    externalProductId: normalizeText(product.externalProductId),
    productUrl: firstNonEmpty(product?.productUrl),
    variantCount: Number(product?.variantCount) || 0,
    sortOrder: Number.isFinite(Number(product?.sortOrder)) ? Number(product.sortOrder) : null,
    materials: normalizeText(product?.materials),
    sizeGuide: normalizeText(product?.sizeGuide),
    shippingReturns: normalizeText(product?.shippingReturns),
    whatsIncluded: normalizeText(product?.whatsIncluded),
    displayPrice:
      firstNonEmpty(product?.displayPrice) ||
      (fallbackNumericPrice != null ? formatPrice(fallbackNumericPrice) : 'Price unavailable'),
  };
}

function normalizeProductDetail(product, fallbackProduct = {}) {
  const variants = getRawVariants(product).map((variant) => normalizeVariant(variant));
  const firstVariant = variants[0] || null;

  return {
    id: fallbackProduct.id || product?.id || product?.sync_product?.id || '',
    title: firstNonEmpty(
      fallbackProduct.title,
      product?.name,
      product?.title,
      product?.sync_product?.name,
      'Untitled product'
    ),
    description: firstNonEmpty(
      fallbackProduct.description,
      product?.description,
      product?.summary,
      product?.sync_product?.description
    ),
    image: firstNonEmpty(inferImage(product), fallbackProduct.image),
    brand: firstNonEmpty(fallbackProduct.brand, titleCase(inferBrand(product))),
    category: firstNonEmpty(fallbackProduct.category, titleCase(inferCategory(product))),
    productUrl: firstNonEmpty(fallbackProduct.productUrl, inferProductUrl(product)),
    materials: firstNonEmpty(fallbackProduct.materials),
    sizeGuide: firstNonEmpty(fallbackProduct.sizeGuide),
    shippingReturns: firstNonEmpty(fallbackProduct.shippingReturns),
    whatsIncluded: firstNonEmpty(fallbackProduct.whatsIncluded),
    displayPrice:
      firstVariant?.retailPrice != null
        ? formatPrice(firstVariant.retailPrice, firstVariant.currency || 'GBP')
        : fallbackProduct.displayPrice || inferDisplayPriceFromPrintful(product),
    variants,
  };
}

export default {
  name: 'MerchPage',

  data() {
    return {
      products: [],
      allBrands: [],
      allCategories: [],
      loading: true,
      syncing: false,
      status: '',
      fallbackImage: 'https://via.placeholder.com/600x600?text=Project+Respawn',
      selectedProduct: null,
      selectedColor: '',
      selectedSize: '',
      selectedQuantity: 1,
      selectedCategory: '',
      selectedBrand: '',
    };
  },

  computed: {
    brandOptions() {
      return [...new Set(this.allBrands.map((brand) => titleCase(brand.name)).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    },

    categoryOptions() {
      return [...new Set(this.allCategories.map((category) => titleCase(category.name)).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    },

    filteredProducts() {
      return this.products.filter((product) => {
        const matchesBrand =
          !this.selectedBrand ||
          product.brand === this.selectedBrand ||
          product.brands?.includes(this.selectedBrand);

        const matchesCategory =
          !this.selectedCategory ||
          product.category === this.selectedCategory ||
          product.categories?.includes(this.selectedCategory);

        return matchesBrand && matchesCategory;
      });
    },

    statusMessage() {
      if (this.loading) return 'Loading products...';
      if (this.syncing) return 'Syncing products from Printful...';

      if (this.selectedBrand || this.selectedCategory) {
        if (!this.filteredProducts.length) {
          return 'Check back for new products soon 🙂';
        }
      }

      if (!this.products.length) {
        return this.status || 'No products available right now.';
      }

      return `${this.filteredProducts.length} of ${this.products.length} products shown`;
    },

    availableColors() {
      if (!this.selectedProduct?.variants?.length) return [];

      return [
        ...new Set(
          this.selectedProduct.variants
            .map((variant) => variant.color)
            .filter(Boolean)
        ),
      ];
    },

    availableSizes() {
      if (!this.selectedProduct?.variants?.length) return [];

      const matchingVariants = this.selectedColor
        ? this.selectedProduct.variants.filter(
            (variant) => variant.color === this.selectedColor
          )
        : this.selectedProduct.variants;

      return [...new Set(matchingVariants.map((variant) => variant.size).filter(Boolean))];
    },

    selectedVariant() {
      if (!this.selectedProduct?.variants?.length) return null;

      return (
        this.selectedProduct.variants.find((variant) => {
          const colorMatch = !this.selectedColor || variant.color === this.selectedColor;
          const sizeMatch = !this.selectedSize || variant.size === this.selectedSize;
          return colorMatch && sizeMatch;
        }) || null
      );
    },

    selectedVariantPrice() {
      if (!this.selectedVariant) {
        return this.selectedProduct?.displayPrice || 'Price unavailable';
      }

      if (this.selectedVariant.retailPrice == null) {
        return this.selectedProduct?.displayPrice || 'Price unavailable';
      }

      return formatPrice(
        this.selectedVariant.retailPrice,
        this.selectedVariant.currency || 'GBP'
      );
    },

    selectedVariantImage() {
      if (!this.selectedProduct) {
        return this.fallbackImage;
      }

      const baseImage = this.selectedProduct.image || this.fallbackImage;

      if (!this.selectedColor || !this.selectedProduct.variants?.length) {
        return baseImage;
      }

      const imageVariant = this.selectedProduct.variants.find(
        (variant) => variant.color === this.selectedColor && variant.image
      );

      return imageVariant?.image || baseImage;
    },
  },

  async mounted() {
    await this.loadProducts();
  },

  methods: {
    async handleManualPrintfulSync() {
      if (this.syncing) return;
      await this.syncPrintfulProductsToDatabase();
      await this.loadProducts();
    },

    async syncPrintfulProductsToDatabase() {
      this.syncing = true;
      this.status = 'Syncing products from Printful...';

      try {
        const externalData = await fetchProducts();
        const printfulProducts = getProductArray(externalData);

        const { data: existingProducts, errors: existingErrors } =
          await getClient().models.MerchProduct.list({
            authMode: 'userPool',
          });

        if (existingErrors?.length) {
          throw new Error(existingErrors[0].message || 'Failed to load existing merch products.');
        }

        const existingByExternalId = new Map(
          (existingProducts || [])
            .filter(
              (item) =>
                normalizeText(item?.sourceType) === 'printful' &&
                normalizeText(item?.externalProductId)
            )
            .map((item) => [normalizeText(item.externalProductId), item])
        );

        for (let index = 0; index < printfulProducts.length; index += 1) {
          const rawProduct = printfulProducts[index];
          const externalProductId = String(
            rawProduct?.id || rawProduct?.sync_product?.id || ''
          ).trim();

          if (!externalProductId) {
            continue;
          }

          let productForSync = rawProduct;
          let displayPrice = inferDisplayPriceFromPrintful(productForSync);

          if (displayPrice === 'Price unavailable') {
            try {
              const detailResponse = await fetchProductById(externalProductId);
              const detailProduct =
                detailResponse?.product || detailResponse?.result || detailResponse;

              if (detailProduct) {
                productForSync = detailProduct;
                displayPrice = inferDisplayPriceFromPrintful(productForSync);
              }
            } catch (detailError) {
              console.warn(
                `Could not load detail pricing for product ${externalProductId}`,
                detailError
              );
            }
          }

          const title = inferTitle(productForSync, index);
          const description = inferDescription(productForSync);
          const imageUrl = inferImage(productForSync);
          const productUrl = inferProductUrl(productForSync);
          const variantCount = inferVariantCount(productForSync);
          const slug = slugify(title) || `product-${index + 1}`;
          const existing = existingByExternalId.get(externalProductId);

          const payload = {
            title,
            slug,
            description,
            imageUrl,
            sourceType: 'printful',
            externalProductId,
            productUrl,
            variantCount,
            displayPrice,
            status: 'active',
            isVisible: true,
            sortOrder: existing?.sortOrder ?? index,
          };

          if (!existing) {
            const { errors } = await getClient().models.MerchProduct.create(payload, {
              authMode: 'userPool',
            });

            if (errors?.length) {
              throw new Error(errors[0].message || `Failed to create ${title}.`);
            }
          } else {
            const { errors } = await getClient().models.MerchProduct.update(
              {
                id: existing.id,
                ...payload,
                sortOrder: existing.sortOrder ?? payload.sortOrder,
              },
              {
                authMode: 'userPool',
              }
            );

            if (errors?.length) {
              throw new Error(errors[0].message || `Failed to update ${title}.`);
            }
          }
        }

        this.status = 'Printful products synced successfully.';
      } catch (error) {
        console.error('Printful merch sync error:', error);
        this.status = error?.message || 'Could not sync Printful products.';
      } finally {
        this.syncing = false;
      }
    },

    async loadProducts() {
      this.loading = true;

      try {
        const [
          productsResult,
          brandsResult,
          categoriesResult,
          productBrandsResult,
          productCategoriesResult,
        ] = await Promise.all([
          getClient().models.MerchProduct.list({ authMode: 'apiKey' }),
          getClient().models.Brand.list({ authMode: 'apiKey' }),
          getClient().models.MerchCategory.list({ authMode: 'apiKey' }),
          getClient().models.MerchProductBrand.list({ authMode: 'apiKey' }),
          getClient().models.MerchProductCategory.list({ authMode: 'apiKey' }),
        ]);

        if (productsResult.errors?.length) {
          throw new Error(productsResult.errors[0].message || 'Failed to load products.');
        }

        if (brandsResult.errors?.length) {
          throw new Error(brandsResult.errors[0].message || 'Failed to load brands.');
        }

        if (categoriesResult.errors?.length) {
          throw new Error(categoriesResult.errors[0].message || 'Failed to load categories.');
        }

        if (productBrandsResult.errors?.length) {
          throw new Error(
            productBrandsResult.errors[0].message || 'Failed to load product brand links.'
          );
        }

        if (productCategoriesResult.errors?.length) {
          throw new Error(
            productCategoriesResult.errors[0].message || 'Failed to load product category links.'
          );
        }

        this.allBrands = (brandsResult.data || [])
          .filter((brand) => normalizeText(brand?.status) === 'active')
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        this.allCategories = (categoriesResult.data || [])
          .filter((category) => category.isActive !== false)
          .filter((category) => {
            const status = normalizeText(category?.status);
            return !status || status === 'active';
          })
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        const brandsById = new Map(
          this.allBrands.map((brand) => [brand.id, brand.name || ''])
        );

        const categoriesById = new Map(
          this.allCategories.map((category) => [category.id, category.name || ''])
        );

        const brandNamesByProductId = new Map();
        for (const link of productBrandsResult.data || []) {
          const productId = link.productId;
          const brandName = brandsById.get(link.brandId);
          if (!productId || !brandName) continue;

          const current = brandNamesByProductId.get(productId) || [];
          current.push(brandName);
          brandNamesByProductId.set(productId, current);
        }

        const categoryNamesByProductId = new Map();
        for (const link of productCategoriesResult.data || []) {
          const productId = link.productId;
          const categoryName = categoriesById.get(link.categoryId);
          if (!productId || !categoryName) continue;

          const current = categoryNamesByProductId.get(productId) || [];
          current.push(categoryName);
          categoryNamesByProductId.set(productId, current);
        }

        this.products = (productsResult.data || [])
          .filter((product) => product.isVisible !== false)
          .filter((product) => {
            const status = normalizeText(product?.status);
            return !status || status === 'active';
          })
          .map((product) =>
            normalizeStoredProduct(
              product,
              brandNamesByProductId.get(product.id) || [],
              categoryNamesByProductId.get(product.id) || []
            )
          )
          .sort((a, b) => {
            const orderA = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 999999;
            const orderB = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 999999;
            if (orderA !== orderB) return orderA - orderB;
            return a.title.localeCompare(b.title);
          });

        this.status = `${this.products.length} products loaded`;
      } catch (error) {
        console.error('Merch page load error:', error);
        this.products = [];
        this.allBrands = [];
        this.allCategories = [];
        this.status = error?.message || 'Could not load products right now.';
      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
      this.selectedBrand = '';
      this.selectedCategory = '';
    },

    async openPrintfulProduct(product) {
      try {
        this.status = 'Loading product details...';

        let selectedProduct = {
          id: product.internalId || product.id,
          title: product.title,
          description: product.description,
          image: product.image || this.fallbackImage,
          brand: product.brand,
          category: product.category,
          productUrl: product.productUrl,
          displayPrice: product.displayPrice,
          materials: product.materials || '',
          sizeGuide: product.sizeGuide || '',
          shippingReturns: product.shippingReturns || '',
          whatsIncluded: product.whatsIncluded || '',
          variants: [],
        };

        if (product.sourceType === 'printful' && product.externalProductId) {
          const response = await fetchProductById(product.externalProductId);
          const rawProduct = response?.product || response?.result || response;

          if (rawProduct) {
            selectedProduct = normalizeProductDetail(rawProduct, selectedProduct);
          }
        }

        this.selectedProduct = selectedProduct;

        const firstVariant = this.selectedProduct.variants[0] || null;
        this.selectedColor = firstVariant?.color || '';
        this.selectedSize = firstVariant?.size || '';
        this.selectedQuantity = 1;

        await nextTick();

        if (
          this.$refs.productDialog &&
          typeof this.$refs.productDialog.showModal === 'function' &&
          !this.$refs.productDialog.open
        ) {
          this.$refs.productDialog.showModal();
        }

        this.status = `${this.products.length} products loaded`;
      } catch (error) {
        console.error('Product modal error:', error);
        this.status = error?.message || 'Could not load product details.';
      }
    },

    onColorChange() {
      const sizesForColor =
        this.selectedProduct?.variants
          ?.filter((variant) => variant.color === this.selectedColor)
          .map((variant) => variant.size)
          .filter(Boolean) || [];

      if (!sizesForColor.includes(this.selectedSize)) {
        this.selectedSize = sizesForColor[0] || '';
      }
    },

    normalizeQuantity() {
      this.selectedQuantity = Math.max(1, Number(this.selectedQuantity) || 1);
    },

    addToCart() {
      if (!this.selectedProduct) {
        this.status = 'No product selected.';
        return;
      }

      if (this.selectedProduct.variants?.length && !this.selectedVariant) {
        this.status = 'Please select a valid colour and size.';
        return;
      }

      const safeQuantity = Math.max(1, Number(this.selectedQuantity) || 1);

      const cartItem = {
        productId: this.selectedProduct.id,
        title: this.selectedProduct.title,
        image: this.selectedVariantImage || this.selectedProduct.image || this.fallbackImage,
        price: this.selectedVariantPrice,
        productUrl: this.selectedProduct.productUrl || '',
        quantity: safeQuantity,
        variantId: this.selectedVariant?.id || '',
        variantName: this.selectedVariant?.name || '',
        color: this.selectedVariant?.color || this.selectedColor || '',
        size: this.selectedVariant?.size || this.selectedSize || '',
        availabilityStatus: this.selectedVariant?.availabilityStatus || '',
      };

      console.log('Add to cart item:', cartItem);
      this.status = `${cartItem.title} added to cart`;
    },

    closeDialog() {
      if (this.$refs.productDialog && typeof this.$refs.productDialog.close === 'function') {
        this.$refs.productDialog.close();
      }

      this.selectedProduct = null;
      this.selectedColor = '';
      this.selectedSize = '';
      this.selectedQuantity = 1;
      this.status = `${this.products.length} products loaded`;
    },
  },
};