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

function getRawVariants(product) {
  if (Array.isArray(product?.sync_variants)) return product.sync_variants;
  if (Array.isArray(product?.variants)) return product.variants;
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
  if (Array.isArray(product?.sync_variants)) return product.sync_variants.length;
  if (Array.isArray(product?.variants)) return product.variants.length;
  if (Number.isFinite(Number(product?.variantCount))) return Number(product.variantCount);
  if (Number.isFinite(Number(product?.variant_count))) return Number(product.variant_count);
  return 0;
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

  if (!prices.length) return 'Price unavailable';
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

// NEW: extract mockup URLs from a raw Printful variant
function getMockupUrlsFromVariant(rawVariant) {
  const urls = [];

  const files = Array.isArray(rawVariant?.files) ? rawVariant.files : [];
  for (const file of files) {
    const type = normalizeText(file.type).toLowerCase();
    if (type === 'mockup') {
      const url = firstNonEmpty(file.preview_url, file.url);
      if (url) {
        urls.push(url);
      }
    }
  }

  if (!urls.length) {
    const fallback = firstNonEmpty(
      rawVariant?.image,
      rawVariant?.imageUrl,
      rawVariant?.image_url
    );
    if (fallback) urls.push(fallback);
  }

  return urls;
}

function normalizePrintfulVariant(variant) {
  const retailPrice = inferPriceNumber(
    variant?.retail_price,
    variant?.retailPrice,
    variant?.price,
    variant?.sync_variant?.retail_price
  );

  const imageUrl = firstNonEmpty(
    variant?.image,
    variant?.imageUrl,
    variant?.image_url,
    variant?.files?.[0]?.preview_url,
    variant?.files?.[0]?.url
  );

  return {
    id: normalizeText(variant?.id),
    externalVariantId: normalizeText(variant?.id),
    name: firstNonEmpty(variant?.name, variant?.title),
    color: titleCase(firstNonEmpty(variant?.color, variant?.colour)),
    size: firstNonEmpty(variant?.size),
    imageUrl,
    currency: firstNonEmpty(variant?.currency, 'GBP'),
    retailPrice,
    availabilityStatus: mapAvailabilityStatus(variant),
    displayPrice:
      retailPrice != null ? formatPrice(retailPrice, firstNonEmpty(variant?.currency, 'GBP')) : '',
  };
}

function normalizeStoredImage(image) {
  return {
    id: image.id,
    url: normalizeText(image.url),
    altText: normalizeText(image.altText),
    color: titleCase(image.color),
    colorHex: normalizeText(image.colorHex),
    sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : 999999,
    isPrimary: image.isPrimary === true,
    isMockup: image.isMockup === true,
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
    displayPrice:
      firstNonEmpty(variant.displayPrice) ||
      (retailPrice != null ? formatPrice(retailPrice, firstNonEmpty(variant.currency, 'GBP')) : ''),
    retailPrice,
    currency: firstNonEmpty(variant.currency, 'GBP'),
    availabilityStatus: firstNonEmpty(variant.availabilityStatus, 'Availability unknown'),
    imageUrl: normalizeText(variant.imageUrl),
    sortOrder: Number.isFinite(Number(variant.sortOrder)) ? Number(variant.sortOrder) : 999999,
    status: normalizeText(variant.status),
  };
}

function resolvePrimaryImage(product, images = []) {
  const activeImages = images.filter(
    (image) => !normalizeText(image.status) || normalizeText(image.status) === 'active'
  );

  const primaryImage = activeImages.find((image) => image.isPrimary && image.url);
  if (primaryImage?.url) return primaryImage.url;

  const firstSortedImage = [...activeImages]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((image) => image.url);
  if (firstSortedImage?.url) return firstSortedImage.url;

  return firstNonEmpty(product?.thumbnailUrl, product?.imageUrl);
}

function normalizeStoredProduct(
  product,
  productBrands = [],
  productCategories = [],
  productImages = [],
  productVariants = []
) {
  const fallbackNumericPrice = inferPriceNumber(
    product?.basePrice,
    product?.price,
    product?.retailPrice,
    product?.retail_price
  );

  const normalizedBrands = [...new Set(productBrands.map((value) => titleCase(value)).filter(Boolean))];
  const normalizedCategories = [
    ...new Set(productCategories.map((value) => titleCase(value)).filter(Boolean)),
  ];
  const normalizedImages = productImages
    .map((image) => normalizeStoredImage(image))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const normalizedVariants = productVariants
    .map((variant) => normalizeStoredVariant(variant))
    .filter((variant) => !variant.status || variant.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  return {
    id: product.id,
    internalId: product.id,
    title: normalizeText(product.title) || 'Untitled product',
    shortDescription: normalizeText(product.shortDescription),
    description: normalizeText(product.description),
    image: resolvePrimaryImage(product, normalizedImages),
    thumbnailUrl: firstNonEmpty(product.thumbnailUrl, product.imageUrl),
    images: normalizedImages,
    brand: normalizedBrands[0] || '',
    brands: normalizedBrands,
    category: normalizedCategories[0] || '',
    categories: normalizedCategories,
    sourceType: normalizeText(product.sourceType),
    externalProductId: normalizeText(product.externalProductId),
    externalVariantGroupId: normalizeText(product.externalVariantGroupId),
    productUrl: firstNonEmpty(product.productUrl),
    variantCount: Number(product?.variantCount) || normalizedVariants.length,
    sortOrder: Number.isFinite(Number(product?.sortOrder)) ? Number(product.sortOrder) : null,
    materials: normalizeText(product.materials),
    sizeGuide: normalizeText(product.sizeGuide),
    shippingReturns: normalizeText(product.shippingReturns),
    whatsIncluded: normalizeText(product.whatsIncluded),
    careInstructions: normalizeText(product.careInstructions),
    fitNotes: normalizeText(product.fitNotes),
    displayPrice:
      firstNonEmpty(product.displayPrice) ||
      (fallbackNumericPrice != null
        ? formatPrice(fallbackNumericPrice, firstNonEmpty(product.currency, 'GBP'))
        : 'Price unavailable'),
    variants: normalizedVariants,
  };
}

function buildVariantImageMap(images = []) {
  const map = new Map();
  for (const image of images) {
    if (!image?.url || !image?.color) continue;
    const colorKey = titleCase(image.color).toLowerCase();
    if (!colorKey) continue;
    if (!map.has(colorKey) || image.isPrimary) {
      map.set(colorKey, image.url);
    }
  }
  return map;
}

function mergeStoredAndPrintfulVariants(storedVariants = [], printfulVariants = [], storedImages = []) {
  const storedByExternalId = new Map(
    storedVariants
      .filter((variant) => variant.externalVariantId)
      .map((variant) => [variant.externalVariantId, variant])
  );
  const imageByColor = buildVariantImageMap(storedImages);

  const merged = printfulVariants.map((printfulVariant) => {
    const storedVariant = storedByExternalId.get(printfulVariant.externalVariantId);
    const colorImage = imageByColor.get(titleCase(printfulVariant.color).toLowerCase());

    return {
      ...printfulVariant,
      ...storedVariant,
      color: firstNonEmpty(storedVariant?.color, printfulVariant.color),
      size: firstNonEmpty(storedVariant?.size, printfulVariant.size),
      name: firstNonEmpty(storedVariant?.name, printfulVariant.name),
      displayPrice: firstNonEmpty(storedVariant?.displayPrice, printfulVariant.displayPrice),
      availabilityStatus: firstNonEmpty(
        storedVariant?.availabilityStatus,
        printfulVariant.availabilityStatus
      ),
      imageUrl: firstNonEmpty(colorImage, storedVariant?.imageUrl, printfulVariant.imageUrl),
      retailPrice:
        storedVariant?.retailPrice != null ? storedVariant.retailPrice : printfulVariant.retailPrice,
      currency: firstNonEmpty(storedVariant?.currency, printfulVariant.currency, 'GBP'),
    };
  });

  if (merged.length) return merged;

  return storedVariants.map((variant) => {
    const colorImage = imageByColor.get(titleCase(variant.color).toLowerCase());
    return {
      ...variant,
      imageUrl: firstNonEmpty(colorImage, variant.imageUrl),
    };
  });
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
      return [...new Set(this.allBrands.map((brand) => titleCase(brand.name)).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      );
    },

    categoryOptions() {
      return [
        ...new Set(this.allCategories.map((category) => titleCase(category.name)).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));
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
      if ((this.selectedBrand || this.selectedCategory) && !this.filteredProducts.length) {
        return 'Check back for new products soon 🙂';
      }
      if (!this.products.length) {
        return this.status || 'No products available right now.';
      }
      return `${this.filteredProducts.length} of ${this.products.length} products shown`;
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

    selectedVariantImage() {
      if (!this.selectedProduct) return this.fallbackImage;
      const baseImage = this.selectedProduct.image || this.fallbackImage;
      if (!this.selectedColor) return baseImage;

      const variantMatch = this.selectedProduct.variants.find(
        (variant) => variant.color === this.selectedColor && variant.imageUrl
      );
      if (variantMatch?.imageUrl) return variantMatch.imageUrl;

      const storedImageMatch = this.selectedProduct.images?.find(
        (image) => image.color === this.selectedColor && image.url
      );
      return storedImageMatch?.url || baseImage;
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
        const client = getClient();
        const externalData = await fetchProducts();
        const printfulProducts = getProductArray(externalData);

        const [existingProductsResult, existingImagesResult, existingVariantsResult] = await Promise.all([
          client.models.MerchProduct.list({ authMode: 'userPool' }),
          client.models.MerchProductImage.list({ authMode: 'userPool' }),
          client.models.MerchProductVariant.list({ authMode: 'userPool' }),
        ]);

        if (existingProductsResult.errors?.length) {
          throw new Error(
            existingProductsResult.errors[0].message || 'Failed to load existing merch products.'
          );
        }
        if (existingImagesResult.errors?.length) {
          throw new Error(
            existingImagesResult.errors[0].message || 'Failed to load existing merch images.'
          );
        }
        if (existingVariantsResult.errors?.length) {
          throw new Error(
            existingVariantsResult.errors[0].message || 'Failed to load existing merch variants.'
          );
        }

        const existingByExternalId = new Map(
          (existingProductsResult.data || [])
            .filter(
              (item) =>
                normalizeText(item?.sourceType) === 'printful' &&
                normalizeText(item?.externalProductId)
            )
            .map((item) => [normalizeText(item.externalProductId), item])
        );

        const imagesByProductId = new Map();
        for (const image of existingImagesResult.data || []) {
          const productId = normalizeText(image.productId);
          if (!productId) continue;
          const current = imagesByProductId.get(productId) || [];
          current.push(image);
          imagesByProductId.set(productId, current);
        }

        const variantsByProductId = new Map();
        for (const variant of existingVariantsResult.data || []) {
          const productId = normalizeText(variant.productId);
          if (!productId) continue;
          const current = variantsByProductId.get(productId) || [];
          current.push(variant);
          variantsByProductId.set(productId, current);
        }

        for (let index = 0; index < printfulProducts.length; index += 1) {
          const rawProduct = printfulProducts[index];
          const externalProductId = String(rawProduct?.id || rawProduct?.sync_product?.id || '').trim();
          if (!externalProductId) continue;

          let detailProduct = rawProduct;
          try {
            const detailResponse = await fetchProductById(externalProductId);
            detailProduct = detailResponse?.product || detailResponse?.result || detailResponse || rawProduct;
          } catch (detailError) {
            console.warn(`Could not load detail for product ${externalProductId}`, detailError);
          }

          const title = inferTitle(detailProduct, index);
          const description = inferDescription(detailProduct);
          const thumbnailUrl = inferImage(detailProduct);
          const productUrl = inferProductUrl(detailProduct);
          const variantCount = inferVariantCount(detailProduct);
          const slug = slugify(title) || `product-${index + 1}`;
          const displayPrice = inferDisplayPriceFromPrintful(detailProduct);
          const existing = existingByExternalId.get(externalProductId);

          const payload = {
            title,
            slug,
            shortDescription: description,
            description,
            thumbnailUrl,
            imageUrl: thumbnailUrl,
            sourceType: 'printful',
            externalProductId,
            externalVariantGroupId: normalizeText(detailProduct?.externalVariantGroupId),
            sku: normalizeText(detailProduct?.sku),
            displayPrice,
            basePrice: inferPriceNumber(displayPrice),
            currency: 'GBP',
            productUrl,
            variantCount,
            status: 'active',
            isVisible: true,
            sortOrder: existing?.sortOrder ?? index,
          };

          let productId = existing?.id || '';

          if (!existing) {
            const createResult = await client.models.MerchProduct.create(payload, {
              authMode: 'userPool',
            });
            if (createResult.errors?.length) {
              throw new Error(createResult.errors[0].message || `Failed to create ${title}.`);
            }
            productId = createResult.data?.id || '';
          } else {
            const updateResult = await client.models.MerchProduct.update(
              {
                id: existing.id,
                ...payload,
                sortOrder: existing.sortOrder ?? payload.sortOrder,
              },
              { authMode: 'userPool' }
            );
            if (updateResult.errors?.length) {
              throw new Error(updateResult.errors[0].message || `Failed to update ${title}.`);
            }
            productId = existing.id;
          }

          if (!productId) continue;

          const existingImages = imagesByProductId.get(productId) || [];
          const existingVariants = variantsByProductId.get(productId) || [];

          const existingImageByKey = new Map(
            existingImages.map((image) => [
              `${normalizeText(image.color).toLowerCase()}::${
                normalizeText(image.externalImageId) || normalizeText(image.url)
              }`,
              image,
            ])
          );

          const existingVariantByExternalId = new Map(
            existingVariants
              .filter((variant) => normalizeText(variant.externalVariantId))
              .map((variant) => [normalizeText(variant.externalVariantId), variant])
          );

          const rawVariants = getRawVariants(detailProduct);
          const normalizedVariants = rawVariants.map((variant) => normalizePrintfulVariant(variant));

          for (let variantIndex = 0; variantIndex < normalizedVariants.length; variantIndex += 1) {
            const variant = normalizedVariants[variantIndex];

            const variantPayload = {
              productId,
              externalVariantId: variant.externalVariantId,
              sku: '',
              name: variant.name || `${title} ${variant.color} ${variant.size}`.trim(),
              color: variant.color,
              size: variant.size,
              displayPrice: variant.displayPrice,
              retailPrice: variant.retailPrice,
              currency: variant.currency || 'GBP',
              availabilityStatus: variant.availabilityStatus,
              imageUrl: variant.imageUrl,
              sortOrder: variantIndex,
              status: 'active',
            };

            const existingVariant = existingVariantByExternalId.get(variant.externalVariantId);

            if (!existingVariant) {
              const createVariantResult = await client.models.MerchProductVariant.create(variantPayload, {
                authMode: 'userPool',
              });
              if (createVariantResult.errors?.length) {
                throw new Error(
                  createVariantResult.errors[0].message || `Failed to create variant for ${title}.`
                );
              }
            } else {
              const updateVariantResult = await client.models.MerchProductVariant.update(
                { id: existingVariant.id, ...variantPayload },
                { authMode: 'userPool' }
              );
              if (updateVariantResult.errors?.length) {
                throw new Error(
                  updateVariantResult.errors[0].message || `Failed to update variant for ${title}.`
                );
              }
            }

            // NEW: create images from all mockup URLs
            const rawVariant = rawVariants[variantIndex] || {};
            const mockupUrls = getMockupUrlsFromVariant(rawVariant);

            for (let imageIndex = 0; imageIndex < mockupUrls.length; imageIndex += 1) {
              const imageUrl = mockupUrls[imageIndex];

              const imageKey = `${normalizeText(variant.color).toLowerCase()}::${
                normalizeText(variant.externalVariantId) || normalizeText(imageUrl)
              }`;

              const imagePayload = {
                productId,
                url: imageUrl,
                altText: `${title}${variant.color ? ` - ${variant.color}` : ''}${
                  variant.size ? ` - ${variant.size}` : ''
                }`,
                color: variant.color,
                sortOrder: imageIndex,
                isPrimary: imageIndex === 0,
                isMockup: true,
                sourceType: 'printful',
                externalImageId: variant.externalVariantId || imageUrl,
                status: 'active',
              };

              const existingImage = existingImageByKey.get(imageKey);

              if (!existingImage) {
                const createImageResult = await client.models.MerchProductImage.create(imagePayload, {
                  authMode: 'userPool',
                });
                if (createImageResult.errors?.length) {
                  throw new Error(
                    createImageResult.errors[0].message || `Failed to create image for ${title}.`
                  );
                }
              } else {
                const updateImageResult = await client.models.MerchProductImage.update(
                  { id: existingImage.id, ...imagePayload },
                  { authMode: 'userPool' }
                );
                if (updateImageResult.errors?.length) {
                  throw new Error(
                    updateImageResult.errors[0].message || `Failed to update image for ${title}.`
                  );
                }
              }
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
        const client = getClient();
        const [
          productsResult,
          brandsResult,
          categoriesResult,
          productBrandsResult,
          productCategoriesResult,
          productImagesResult,
          productVariantsResult,
        ] = await Promise.all([
          client.models.MerchProduct.list({ authMode: 'apiKey' }),
          client.models.Brand.list({ authMode: 'apiKey' }),
          client.models.MerchCategory.list({ authMode: 'apiKey' }),
          client.models.MerchProductBrand.list({ authMode: 'apiKey' }),
          client.models.MerchProductCategory.list({ authMode: 'apiKey' }),
          client.models.MerchProductImage.list({ authMode: 'apiKey' }),
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
          throw new Error(
            productBrandsResult.errors[0].message || 'Failed to load product brand links.'
          );
        }
        if (productCategoriesResult.errors?.length) {
          throw new Error(
            productCategoriesResult.errors[0].message || 'Failed to load product category links.'
          );
        }
        if (productImagesResult.errors?.length) {
          throw new Error(productImagesResult.errors[0].message || 'Failed to load product images.');
        }
        if (productVariantsResult.errors?.length) {
          throw new Error(
            productVariantsResult.errors[0].message || 'Failed to load product variants.'
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

        const brandsById = new Map(this.allBrands.map((brand) => [brand.id, brand.name || '']));
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

        const imagesByProductId = new Map();
        for (const image of productImagesResult.data || []) {
          const productId = normalizeText(image.productId);
          if (!productId) continue;
          const current = imagesByProductId.get(productId) || [];
          current.push(image);
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
              categoryNamesByProductId.get(product.id) || [],
              imagesByProductId.get(product.id) || [],
              variantsByProductId.get(product.id) || []
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
          shortDescription: product.shortDescription,
          description: product.description,
          image: product.image || this.fallbackImage,
          images: product.images || [],
          brand: product.brand,
          category: product.category,
          productUrl: product.productUrl,
          displayPrice: product.displayPrice,
          materials: product.materials || '',
          sizeGuide: product.sizeGuide || '',
          shippingReturns: product.shippingReturns || '',
          whatsIncluded: product.whatsIncluded || '',
          careInstructions: product.careInstructions || '',
          fitNotes: product.fitNotes || '',
          variants: product.variants || [],
        };

        if (
          product.sourceType === 'printful' &&
          product.externalProductId &&
          (!selectedProduct.variants.length || !selectedProduct.images.length)
        ) {
          const response = await fetchProductById(product.externalProductId);
          const rawProduct = response?.product || response?.result || response;

          if (rawProduct) {
            const printfulVariants = getRawVariants(rawProduct).map((variant) =>
              normalizePrintfulVariant(variant)
            );
            const mergedVariants = mergeStoredAndPrintfulVariants(
              selectedProduct.variants,
              printfulVariants,
              selectedProduct.images
            );

            selectedProduct = {
              ...selectedProduct,
              image: firstNonEmpty(selectedProduct.image, inferImage(rawProduct), this.fallbackImage),
              productUrl: firstNonEmpty(selectedProduct.productUrl, inferProductUrl(rawProduct)),
              displayPrice:
                selectedProduct.displayPrice !== 'Price unavailable'
                  ? selectedProduct.displayPrice
                  : inferDisplayPriceFromPrintful(rawProduct),
              variants: mergedVariants,
            };
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