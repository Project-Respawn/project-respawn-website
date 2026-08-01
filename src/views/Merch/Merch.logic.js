import { nextTick } from 'vue';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import outputs from '../../../amplify_outputs.json';

let client = null;

function getClient() {
  if (!client) {
    client = generateClient();
  }
  return client;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isHttpUrl(value) {
  const text = normalizeText(value);
  return /^https?:\/\//i.test(text);
}

function isRemoteUrl(value) {
  const text = normalizeText(value);
  return /^(https?:\/\/|blob:|data:)/i.test(text);
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

function normalizeImageUrl(value) {
  const text = normalizeText(value);
  if (!text) return '';
  if (isRemoteUrl(text)) return text;
  return text;
}

function getPublicStorageBucketUrl() {
  const storageConfig = outputs?.storage || {};
  const bucketName = normalizeText(storageConfig.bucket_name || storageConfig.buckets?.[0]?.bucket_name);
  const region = normalizeText(storageConfig.aws_region || outputs?.auth?.aws_region || '');

  if (!bucketName || !region) {
    return '';
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com`;
}

function normalizeStoragePath(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  const withoutLeadingSlash = cleanValue.replace(/^\/+/, '');
  if (/^(public|protected|private)\//i.test(withoutLeadingSlash)) {
    return withoutLeadingSlash;
  }

  if (/^products\//i.test(withoutLeadingSlash)) {
    return `public/${withoutLeadingSlash}`;
  }

  return `public/${withoutLeadingSlash}`;
}

function extractStoragePathFromUrl(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  try {
    const parsedUrl = new URL(cleanValue);
    const pathname = decodeURIComponent(parsedUrl.pathname || '').replace(/^\/+/, '');
    return pathname;
  } catch (error) {
    return '';
  }
}

function isLocalAssetPath(value) {
  const cleanValue = normalizeText(value);
  return /^\/(images|assets)\//i.test(cleanValue);
}

function buildPublicStorageUrl(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  if (isRemoteUrl(cleanValue)) {
    return cleanValue;
  }

  const baseUrl = getPublicStorageBucketUrl();
  if (!baseUrl) return '';

  return `${baseUrl}/${normalizeStoragePath(cleanValue)}`;
}

async function resolveStorageUrl(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  if (isLocalAssetPath(cleanValue)) {
    return cleanValue;
  }

  if (isRemoteUrl(cleanValue)) {
    const remotePath = extractStoragePathFromUrl(cleanValue);
    if (remotePath && /^(public|protected|private)\//i.test(remotePath)) {
      try {
        const result = await getUrl({
          path: remotePath,
          options: {
            accessLevel: 'public',
            expiresIn: 3600,
          },
        });
        return result.url.toString();
      } catch (error) {
        return buildPublicStorageUrl(remotePath) || cleanValue;
      }
    }

    return cleanValue;
  }

  const normalizedPath = normalizeStoragePath(cleanValue);
  const publicUrl = buildPublicStorageUrl(cleanValue);

  if (publicUrl) {
    return publicUrl;
  }

  try {
    const result = await getUrl({
      path: normalizedPath,
      options: {
        accessLevel: 'public',
        expiresIn: 3600,
      },
    });

    return result.url.toString();
  } catch (error) {
    console.warn('Failed to resolve merch image URL:', cleanValue);
    return publicUrl;
  }
}

function normalizeStoredImage(image) {
  return {
    id: image.id,
    url: normalizeImageUrl(image.url),
    rawUrl: normalizeText(image.url),
    altText: normalizeText(image.altText),
    color: titleCase(image.color),
    colorHex: normalizeText(image.colorHex),
    sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : 999999,
    isPrimary: image.isPrimary === true,
    isFeatured: image.isFeatured === true,
    isVisible: image.isVisible !== false,
    sourceType: normalizeText(image.sourceType),
    status: normalizeText(image.status),
  };
}

function normalizeStoredVariant(variant) {
  const retailPrice = inferPriceNumber(variant?.retailPrice, variant?.displayPrice);

  return {
    id: variant.id,
    externalVariantId: normalizeText(variant.externalVariantId),
    sku: normalizeText(variant.sku),
    name: normalizeText(variant.name),
    color: titleCase(variant.color),
    colorHex: normalizeText(variant.colorHex),
    size: normalizeText(variant.size),
    displayPrice: firstNonEmpty(
      variant.displayPrice,
      retailPrice != null ? formatPrice(retailPrice, firstNonEmpty(variant.currency, 'GBP')) : ''
    ),
    retailPrice,
    currency: firstNonEmpty(variant.currency, 'GBP'),
    availabilityStatus: firstNonEmpty(variant.availabilityStatus, 'Availability unknown'),
    imageUrl: normalizeImageUrl(variant.imageUrl),
    rawImageUrl: normalizeText(variant.imageUrl),
    sortOrder: Number.isFinite(Number(variant.sortOrder)) ? Number(variant.sortOrder) : 999999,
    status: normalizeText(variant.status),
  };
}

function getActiveImages(images) {
  return images.filter((image) => {
    const status = normalizeText(image.status).toLowerCase();
    return image.isVisible !== false && image.url && (!status || status === 'active');
  });
}

function resolvePrimaryImage(images, fallbackImage = '') {
  const activeImages = getActiveImages(images);

  const primaryImage = activeImages.find((image) => image.isPrimary && image.url);
  if (primaryImage?.url) return primaryImage.url;

  const featuredImage = activeImages.find((image) => image.isFeatured && image.url);
  if (featuredImage?.url) return featuredImage.url;

  const firstSortedImage = [...activeImages]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((image) => image.url);

  if (firstSortedImage?.url) return firstSortedImage.url;

  return fallbackImage;
}

function buildVariantImageMap(images) {
  const map = new Map();

  for (const image of images) {
    if (!image?.url || !image?.color) continue;
    const colorKey = titleCase(image.color.toLowerCase());
    if (!colorKey) continue;

    if (!map.has(colorKey) || image.isFeatured || image.isPrimary) {
      map.set(colorKey, image.url);
    }
  }

  return map;
}

function getColorMatchedImages(images, color) {
  const wantedColor = titleCase(color);
  if (!wantedColor) return [];

  return getActiveImages(images)
    .filter((image) => titleCase(image.color) === wantedColor)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getGalleryImagesForProduct(product, selectedColor, fallbackImage) {
  const allImages = getActiveImages(product?.images || []);
  const colorMatchedImages = getColorMatchedImages(allImages, selectedColor);

  if (colorMatchedImages.length) {
    return [...colorMatchedImages].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  }

  if (allImages.length) {
    return [...allImages].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  }

  const variantImage = normalizeImageUrl(product?.variants?.find(
    (variant) => (!selectedColor || variant.color === selectedColor) && variant.imageUrl
  )?.imageUrl);

  const productFallback = normalizeImageUrl(product?.image) || variantImage || fallbackImage;

  return productFallback
    ? [
        {
          id: 'fallback-image',
          url: productFallback,
          altText: product?.title || 'Product image',
          color: '',
          colorHex: '',
          sortOrder: 0,
          isPrimary: true,
          isFeatured: true,
          isVisible: true,
          sourceType: 'fallback',
          status: 'active',
        },
      ]
    : [];
}

export default {
  name: 'MerchPage',

  data() {
    return {
      products: [],
      allBrands: [],
      allCategories: [],
      loading: true,
      status: '',
        fallbackImage: '/images/ImageTier2.png',

      selectedProduct: null,
      selectedColor: '',
      selectedSize: '',
      selectedQuantity: 1,
      activeGalleryIndex: 0,

      selectedCategory: '',
      selectedBrand: '',
    };
  },

  computed: {
    brandOptions() {
      return [...new Set(this.allBrands.map((brand) => titleCase(brand.name)).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      );
    },

    categoryOptions() {
      return [...new Set(this.allCategories.map((category) => titleCase(category.name)).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      );
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
      if (this.selectedBrand || this.selectedCategory) {
        return this.filteredProducts.length
          ? `${this.filteredProducts.length} products shown`
          : 'No products match the selected filters yet.';
      }
      if (!this.products.length) return this.status || 'No products available right now.';
      return `${this.products.length} products available`;
    },

    availableColors() {
      if (!this.selectedProduct?.variants?.length) return [];
      return [...new Set(this.selectedProduct.variants.map((variant) => variant.color).filter(Boolean))];
    },

    availableSizes() {
      if (!this.selectedProduct?.variants?.length) return [];

      const matchingVariants = this.selectedColor
        ? this.selectedProduct.variants.filter((variant) => variant.color === this.selectedColor)
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

      if (this.selectedVariant.retailPrice == null && !this.selectedVariant.displayPrice) {
        return this.selectedProduct?.displayPrice || 'Price unavailable';
      }

      return (
        this.selectedVariant.displayPrice ||
        formatPrice(this.selectedVariant.retailPrice, this.selectedVariant.currency || 'GBP')
      );
    },

    selectedProductGallery() {
      if (!this.selectedProduct) return [];
      return getGalleryImagesForProduct(
        this.selectedProduct,
        this.selectedColor,
        this.fallbackImage
      );
    },

    activeGalleryImage() {
      const gallery = this.selectedProductGallery;
      if (!gallery.length) {
        return {
          url: this.fallbackImage,
          altText: this.selectedProduct?.title || 'Product image',
        };
      }

      const safeIndex = Math.min(
        Math.max(0, this.activeGalleryIndex),
        gallery.length - 1
      );

      return gallery[safeIndex] || gallery[0];
    },

    selectedVariantImage() {
      return this.activeGalleryImage?.url || this.selectedProduct?.image || this.fallbackImage;
    },
  },

  async mounted() {
    await this.loadProducts();
  },

  methods: {
    async loadProducts() {
      this.loading = true;
      this.status = '';

      try {
        const client = getClient();

        const [
          productsResult,
          brandsResult,
          categoriesResult,
          productBrandsResult,
          productCategoriesResult,
          productImagesResult,
          mediaItemsResult,
          productVariantsResult,
        ] = await Promise.all([
          client.models.MerchProduct.list({ authMode: 'apiKey' }),
          client.models.Brand.list({ authMode: 'apiKey' }),
          client.models.MerchCategory.list({ authMode: 'apiKey' }),
          client.models.MerchProductBrand.list({ authMode: 'apiKey' }),
          client.models.MerchProductCategory.list({ authMode: 'apiKey' }),
          client.models.MerchProductImage.list({ authMode: 'apiKey' }),
          client.models.MediaItem.list({ authMode: 'apiKey' }),
          client.models.MerchProductVariant.list({ authMode: 'apiKey' }),
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
          throw new Error(productBrandsResult.errors[0].message || 'Failed to load product brand links.');
        }
        if (productCategoriesResult.errors?.length) {
          throw new Error(productCategoriesResult.errors[0].message || 'Failed to load product category links.');
        }
        if (productImagesResult.errors?.length) {
          throw new Error(productImagesResult.errors[0].message || 'Failed to load product images.');
        }
        if (mediaItemsResult.errors?.length) {
          throw new Error(mediaItemsResult.errors[0].message || 'Failed to load media items.');
        }
        if (productVariantsResult.errors?.length) {
          throw new Error(productVariantsResult.errors[0].message || 'Failed to load product variants.');
        }

        this.allBrands = (brandsResult.data || [])
          .filter((brand) => normalizeText(brand?.status).toLowerCase() !== 'inactive')
          .sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name)));

        this.allCategories = (categoriesResult.data || [])
          .filter((category) => category.isActive !== false)
          .filter((category) => {
            const status = normalizeText(category?.status).toLowerCase();
            return !status || status === 'active';
          })
          .sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name)));

        const brandsById = new Map(this.allBrands.map((brand) => [brand.id, brand.name]));
        const categoriesById = new Map(this.allCategories.map((category) => [category.id, category.name]));

        const brandNamesByProductId = new Map();
        for (const link of productBrandsResult.data || []) {
          const productId = normalizeText(link.productId);
          const brandName = brandsById.get(link.brandId);
          if (!productId || !brandName) continue;
          const current = brandNamesByProductId.get(productId) || [];
          current.push(brandName);
          brandNamesByProductId.set(productId, current);
        }

        const categoryNamesByProductId = new Map();
        for (const link of productCategoriesResult.data || []) {
          const productId = normalizeText(link.productId);
          const categoryName = categoriesById.get(link.categoryId);
          if (!productId || !categoryName) continue;
          const current = categoryNamesByProductId.get(productId) || [];
          current.push(categoryName);
          categoryNamesByProductId.set(productId, current);
        }

        const imagesByProductId = new Map();
        const mediaItemsById = new Map((mediaItemsResult.data || []).map((item) => [normalizeText(item.id), item]));

        for (const image of productImagesResult.data || []) {
          const productId = normalizeText(image.productId);
          if (!productId) continue;
          const mediaItem = mediaItemsById.get(normalizeText(image.mediaItemId));
          const current = imagesByProductId.get(productId) || [];
          current.push({
            ...image,
            url: normalizeText(mediaItem?.url) || '',
            title: normalizeText(mediaItem?.title) || '',
            altText: firstNonEmpty(image.altTextOverride, mediaItem?.altText, mediaItem?.title),
            color: firstNonEmpty(image.colorOverride, mediaItem?.color),
            colorHex: firstNonEmpty(image.colorHexOverride, mediaItem?.colorHex),
            sourceType: normalizeText(mediaItem?.sourceType) || '',
            status: firstNonEmpty(image.status, mediaItem?.status, 'active'),
          });
          imagesByProductId.set(productId, current);
        }

        const variantsByProductId = new Map();
        for (const variant of productVariantsResult.data || []) {
          const productId = normalizeText(variant.productId);
          if (!productId) continue;
          const current = variantsByProductId.get(productId) || [];
          current.push(variant);
          variantsByProductId.set(productId, current);
        }

        const mappedProducts = await Promise.all(
          (productsResult.data || [])
            .filter((product) => product.isVisible !== false)
            .filter((product) => {
              const status = normalizeText(product?.status).toLowerCase();
              return !status || status === 'active';
            })
            .map(async (product) => {
              const rawImages = imagesByProductId.get(product.id) || [];
              const normalizedImages = rawImages
                .map((image) => normalizeStoredImage(image))
                .filter((image) => image.url)
                .sort((a, b) => a.sortOrder - b.sortOrder);

              const normalizedVariants = (variantsByProductId.get(product.id) || [])
                .map((variant) => normalizeStoredVariant(variant))
                .filter((variant) => {
                  const status = normalizeText(variant.status).toLowerCase();
                  return !status || status === 'active';
                })
                .sort((a, b) => {
                  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
                  return a.name.localeCompare(b.name);
                });

              const imageByColor = buildVariantImageMap(normalizedImages);

              const variantsWithImages = normalizedVariants.map((variant) => ({
                ...variant,
                imageUrl: imageByColor.get(titleCase(variant.color.toLowerCase())) || variant.imageUrl || '',
              }));

              const fallbackNumericPrice = inferPriceNumber(
                product?.basePrice,
                product?.price,
                product?.retailPrice,
                product?.retail_price
              );

              const brandNames = [...new Set((brandNamesByProductId.get(product.id) || []).map(titleCase).filter(Boolean))];
              const categoryNames = [...new Set((categoryNamesByProductId.get(product.id) || []).map(titleCase).filter(Boolean))];

              const fallbackDirectUrl = firstNonEmpty(
                normalizeImageUrl(product.thumbnailUrl),
                normalizeImageUrl(product.imageUrl),
                this.fallbackImage
              );

              const resolvedPrimaryImage = await resolveStorageUrl(
                resolvePrimaryImage(normalizedImages, fallbackDirectUrl)
              );
              const resolvedFallbackImage = await resolveStorageUrl(fallbackDirectUrl);
              const resolvedImages = await Promise.all(
                normalizedImages.map(async (image) => ({
                  ...image,
                  url: await resolveStorageUrl(image.url),
                }))
              );
              const resolvedVariants = await Promise.all(
                variantsWithImages.map(async (variant) => ({
                  ...variant,
                  imageUrl: await resolveStorageUrl(variant.imageUrl || variant.rawImageUrl || ''),
                }))
              );

              return {
                id: product.id,
                internalId: product.id,
                title: normalizeText(product.title) || 'Untitled product',
                shortDescription: normalizeText(product.shortDescription),
                description: normalizeText(product.description),
                image: resolvedPrimaryImage || resolvedFallbackImage || this.fallbackImage,
                thumbnailUrl: resolvedPrimaryImage || resolvedFallbackImage || this.fallbackImage,
                images: resolvedImages,
                brand: brandNames[0] || '',
                brands: brandNames,
                category: categoryNames[0] || '',
                categories: categoryNames,
                sourceType: normalizeText(product.sourceType),
                externalProductId: normalizeText(product.externalProductId),
                externalVariantGroupId: normalizeText(product.externalVariantGroupId),
                productUrl: firstNonEmpty(product.productUrl),
                variantCount: Number(product?.variantCount) || resolvedVariants.length,
                sortOrder: Number.isFinite(Number(product?.sortOrder)) ? Number(product.sortOrder) : 999999,
                materials: normalizeText(product.materials),
                sizeGuide: normalizeText(product.sizeGuide),
                shippingReturns: normalizeText(product.shippingReturns),
                whatsIncluded: normalizeText(product.whatsIncluded),
                careInstructions: normalizeText(product.careInstructions),
                fitNotes: normalizeText(product.fitNotes),
                displayPrice: firstNonEmpty(
                  product.displayPrice,
                  fallbackNumericPrice != null
                    ? formatPrice(fallbackNumericPrice, firstNonEmpty(product.currency, 'GBP'))
                    : 'Price unavailable'
                ),
                variants: resolvedVariants,
              };
            })
        );

        this.products = mappedProducts.sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
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

    async openProduct(product) {
      try {
        this.status = 'Loading product details...';

        this.selectedProduct = {
          id: product.internalId || product.id,
          title: product.title,
          shortDescription: product.shortDescription,
          description: product.description,
          image: product.image || this.fallbackImage,
          images: product.images || [],
          brand: product.brand,
          brands: product.brands || [],
          category: product.category,
          categories: product.categories || [],
          productUrl: product.productUrl,
          displayPrice: product.displayPrice,
          materials: product.materials,
          sizeGuide: product.sizeGuide,
          shippingReturns: product.shippingReturns,
          whatsIncluded: product.whatsIncluded,
          careInstructions: product.careInstructions,
          fitNotes: product.fitNotes,
          variants: product.variants || [],
        };

        const firstVariant = this.selectedProduct.variants[0] || null;
        this.selectedColor = firstVariant?.color || '';
        this.selectedSize = firstVariant?.size || '';
        this.selectedQuantity = 1;
        this.activeGalleryIndex = 0;

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
      const sizesForColor = this.selectedProduct?.variants
        ?.filter((variant) => variant.color === this.selectedColor)
        .map((variant) => variant.size)
        .filter(Boolean) || [];

      if (!sizesForColor.includes(this.selectedSize)) {
        this.selectedSize = sizesForColor[0] || '';
      }

      this.activeGalleryIndex = 0;
    },

    selectGalleryImage(index) {
      this.activeGalleryIndex = index;
    },

    prevGalleryImage() {
      if (!this.selectedProductGallery.length) return;
      this.activeGalleryIndex =
        this.activeGalleryIndex <= 0
          ? this.selectedProductGallery.length - 1
          : this.activeGalleryIndex - 1;
    },

    nextGalleryImage() {
      if (!this.selectedProductGallery.length) return;
      this.activeGalleryIndex =
        this.activeGalleryIndex >= this.selectedProductGallery.length - 1
          ? 0
          : this.activeGalleryIndex + 1;
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
        color: this.selectedVariant?.color || this.selectedColor,
        size: this.selectedVariant?.size || this.selectedSize,
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
      this.activeGalleryIndex = 0;
      this.status = this.products.length ? `${this.products.length} products loaded` : 'No products available right now.';
    },
  },
};