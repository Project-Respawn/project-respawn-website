// 1. Imports and Amplify setup
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { fetchProducts, fetchProductById } from '../../Merch/merchService';

let client = null;

function getClient() {
  if (!client) {
    client = generateClient();
  }
  return client;
}

function getModelOrThrow(modelName) {
  const models = getClient()?.models || {};
  const model = models[modelName];

  if (!model) {
    console.error('Available Amplify models:', Object.keys(models));
    throw new Error(
      `Amplify model "${modelName}" is unavailable. Available models: ${Object.keys(models).join(
        ', '
      )}`
    );
  }

  return model;
}

// 2. Text and value helpers

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

// 3. Printful-specific helpers

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

function normalizePrintfulVariant(variant) {
  const retailPrice = inferPriceNumber(
    variant?.retail_price,
    variant?.retailPrice,
    variant?.price,
    variant?.sync_variant?.retail_price
  );

  return {
    id: normalizeText(variant?.id),
    externalVariantId: normalizeText(variant?.id),
    name: firstNonEmpty(variant?.name, variant?.title),
    color: titleCase(firstNonEmpty(variant?.color, variant?.colour)),
    size: firstNonEmpty(variant?.size),
    imageUrl: firstNonEmpty(
      variant?.image,
      variant?.imageUrl,
      variant?.image_url,
      variant?.files?.[0]?.preview_url,
      variant?.files?.[0]?.url
    ),
    currency: firstNonEmpty(variant?.currency, 'GBP'),
    retailPrice,
    availabilityStatus: mapAvailabilityStatus(variant),
    displayPrice:
      retailPrice != null ? formatPrice(retailPrice, firstNonEmpty(variant?.currency, 'GBP')) : '',
  };
}

// 4. Toast helper

function makeToast(vm, message) {
  vm.toastMessage = message;
  window.clearTimeout(vm.toastTimeout);
  vm.toastTimeout = window.setTimeout(() => {
    vm.toastMessage = '';
  }, 3000);
}

// 5. Vue component: state and lifecycle

export default {
  name: 'ProductControl',

  data() {
    return {
      loadingProducts: false,
      savingProduct: false,
      syncingProducts: false,
      loadError: '',
      syncStatus: '',
      toastMessage: '',
      toastTimeout: null,

      products: [],
      brands: [],
      categories: [],
      productBrands: [],
      productCategories: [],
      productImages: [],
      productVariants: [],

      searchQuery: '',
      sourceFilter: 'all',
      visibilityFilter: 'all',

      sourceFilters: [
        { label: 'All Sources', value: 'all' },
        { label: 'Printful', value: 'printful' },
        { label: 'Manual', value: 'manual' },
        { label: 'Other', value: 'other' },
      ],

      visibilityFilters: [
        { label: 'All', value: 'all' },
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' },
      ],

      // Product edit modal
      productModal: null,
      selectedProductId: '',
      productForm: {
        id: '',
        title: '',
        slug: '',
        shortDescription: '',
        description: '',
        materials: '',
        sizeGuide: '',
        shippingReturns: '',
        whatsIncluded: '',
        careInstructions: '',
        fitNotes: '',
        status: 'active',
        isVisible: true,
        brandIds: [],
        categoryIds: [],
        sourceType: '',
        displayPrice: '',
        variantCount: 0,
        imageCount: 0,
      },

      // Media popout
      mediaModalOpen: false,
      selectedProductImages: [],
      mediaForm: {
        featuredImageId: '',
        visibleImageIds: [],
      },

      // Upload state for manual mockups
      mediaUploadFiles: [],
    };
  },

  computed: {
    visibleProductsCount() {
      return this.products.filter((product) => product.isVisible).length;
    },

    printfulProductsCount() {
      return this.products.filter((product) => product.sourceType === 'printful').length;
    },

    brandOptions() {
      return [...this.brands]
        .filter((brand) => normalizeText(brand.name))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    categoryOptions() {
      return [...this.categories]
        .filter((category) => normalizeText(category.name))
        .sort((a, b) => {
          const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 9999;
          const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 9999;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.name.localeCompare(b.name);
        });
    },

    filteredProducts() {
      const query = normalizeText(this.searchQuery).toLowerCase();

      return this.products.filter((product) => {
        const matchesQuery =
          !query ||
          product.title.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query) ||
          product.brandNames.join(' ').toLowerCase().includes(query) ||
          product.categoryNames.join(' ').toLowerCase().includes(query);

        const matchesSource =
          this.sourceFilter === 'all' ||
          (this.sourceFilter === 'other'
            ? !['printful', 'manual'].includes(product.sourceType)
            : product.sourceType === this.sourceFilter);

        const matchesVisibility =
          this.visibilityFilter === 'all' ||
          (this.visibilityFilter === 'visible' && product.isVisible) ||
          (this.visibilityFilter === 'hidden' && !product.isVisible);

        return matchesQuery && matchesSource && matchesVisibility;
      });
    },
  },

  async mounted() {
    await this.loadProducts();
  },

  beforeUnmount() {
    window.clearTimeout(this.toastTimeout);
  },

  methods: {
    // 6. Methods: Printful sync

    async handlePrintfulSync() {
      if (this.syncingProducts) return;

      this.syncingProducts = true;
      this.syncStatus = 'Syncing products from Printful...';
      this.loadError = '';

      try {
        await this.syncPrintfulProductsToDatabase();
        await this.loadProducts();
        this.syncStatus = 'Printful sync completed.';
        makeToast(this, 'Printful products synced');
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to sync Printful products.';
        this.syncStatus = 'Printful sync failed.';
      } finally {
        this.syncingProducts = false;
      }
    },

    async syncPrintfulProductsToDatabase() {
      const externalData = await fetchProducts();
      const printfulProducts = getProductArray(externalData);

      const [existingProductsResult, existingImagesResult, existingVariantsResult] =
        await Promise.all([
          getModelOrThrow('MerchProduct').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchProductImage').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchProductVariant').list({ authMode: 'userPool' }),
        ]);

      const firstExistingError = [
        existingProductsResult,
        existingImagesResult,
        existingVariantsResult,
      ].find((result) => result?.errors?.length)?.errors?.[0];

      if (firstExistingError) {
        throw new Error(firstExistingError.message || 'Failed to load existing merch records.');
      }

      const existingByExternalId = new Map(
        (existingProductsResult.data || [])
          .filter(
            (item) =>
              normalizeText(item?.sourceType).toLowerCase() === 'printful' &&
              normalizeText(item?.externalProductId)
          )
          .map((item) => [normalizeText(item.externalProductId), item])
      );

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
        const externalProductId = String(rawProduct?.id || rawProduct?.sync_product?.id || '')
          .trim();
        if (!externalProductId) continue;

        let detailProduct = rawProduct;
        try {
          const detailResponse = await fetchProductById(externalProductId);
          detailProduct =
            detailResponse?.product || detailResponse?.result || detailResponse || rawProduct;
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
          status: existing?.status || 'active',
          isVisible: existing?.isVisible === false ? false : true,
          sortOrder: existing?.sortOrder ?? index,
        };

        let productId = existing?.id || '';

        if (!existing) {
          const createResult = await getModelOrThrow('MerchProduct').create(payload, {
            authMode: 'userPool',
          });

          if (createResult.errors?.length) {
            throw new Error(createResult.errors[0].message || `Failed to create ${title}.`);
          }

          productId = createResult.data?.id || '';
        } else {
          const updateResult = await getModelOrThrow('MerchProduct').update(
            {
              id: existing.id,
              ...payload,
            },
            { authMode: 'userPool' }
          );

          if (updateResult.errors?.length) {
            throw new Error(updateResult.errors[0].message || `Failed to update ${title}.`);
          }

          productId = existing.id;
        }

        if (!productId) continue;

        const existingVariantsForProduct = variantsByProductId.get(productId) || [];

        const existingVariantByExternalId = new Map(
          existingVariantsForProduct
            .filter((variant) => normalizeText(variant.externalVariantId))
            .map((variant) => [normalizeText(variant.externalVariantId), variant])
        );

        const normalizedVariants = getRawVariants(detailProduct).map((variant) =>
          normalizePrintfulVariant(variant)
        );

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
            const createVariantResult = await getModelOrThrow('MerchProductVariant').create(
              variantPayload,
              { authMode: 'userPool' }
            );

            if (createVariantResult.errors?.length) {
              throw new Error(
                createVariantResult.errors[0].message ||
                  `Failed to create variant for ${title}.`
              );
            }
          } else {
            const updateVariantResult = await getModelOrThrow('MerchProductVariant').update(
              { id: existingVariant.id, ...variantPayload },
              { authMode: 'userPool' }
            );

            if (updateVariantResult.errors?.length) {
              throw new Error(
                updateVariantResult.errors[0].message ||
                  `Failed to update variant for ${title}.`
              );
            }
          }
        }
      }
    },

    // 7. Methods: product loading and editing

    async loadProducts() {
      this.loadingProducts = true;
      this.loadError = '';

      try {
        const [
          productsResult,
          brandsResult,
          categoriesResult,
          productBrandsResult,
          productCategoriesResult,
          productImagesResult,
          productVariantsResult,
        ] = await Promise.all([
          getModelOrThrow('MerchProduct').list({ authMode: 'userPool' }),
          getModelOrThrow('Brand').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchCategory').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchProductBrand').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchProductCategory').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchProductImage').list({ authMode: 'userPool' }),
          getModelOrThrow('MerchProductVariant').list({ authMode: 'userPool' }),
        ]);

        const resultSet = [
          productsResult,
          brandsResult,
          categoriesResult,
          productBrandsResult,
          productCategoriesResult,
          productImagesResult,
          productVariantsResult,
        ];

        const firstError = resultSet.find((result) => result?.errors?.length)?.errors?.[0];
        if (firstError) {
          throw new Error(firstError.message || 'Failed to load merch admin data.');
        }

        this.brands = brandsResult.data || [];
        this.categories = categoriesResult.data || [];
        this.productBrands = productBrandsResult.data || [];
        this.productCategories = productCategoriesResult.data || [];
        this.productImages = productImagesResult.data || [];
        this.productVariants = productVariantsResult.data || [];

        const brandNameById = new Map(
          this.brands.map((brand) => [brand.id, normalizeText(brand.name)])
        );
        const categoryNameById = new Map(
          this.categories.map((category) => [category.id, normalizeText(category.name)])
        );

        const brandLinksByProductId = new Map();
        for (const link of this.productBrands) {
          if (!brandLinksByProductId.has(link.productId)) {
            brandLinksByProductId.set(link.productId, []);
          }
          brandLinksByProductId.get(link.productId).push(link);
        }

        const categoryLinksByProductId = new Map();
        for (const link of this.productCategories) {
          if (!categoryLinksByProductId.has(link.productId)) {
            categoryLinksByProductId.set(link.productId, []);
          }
          categoryLinksByProductId.get(link.productId).push(link);
        }

        const imagesByProductId = new Map();
        for (const image of this.productImages) {
          if (!imagesByProductId.has(image.productId)) {
            imagesByProductId.set(image.productId, []);
          }
          imagesByProductId.get(image.productId).push(image);
        }

        const variantsByProductId = new Map();
        for (const variant of this.productVariants) {
          if (!variantsByProductId.has(variant.productId)) {
            variantsByProductId.set(variant.productId, []);
          }
          variantsByProductId.get(variant.productId).push(variant);
        }

        this.products = (productsResult.data || [])
          .map((product) => {
            const brandLinks = brandLinksByProductId.get(product.id) || [];
            const categoryLinks = categoryLinksByProductId.get(product.id) || [];
            const imageRecords = imagesByProductId.get(product.id) || [];
            const variantRecords = variantsByProductId.get(product.id) || [];

            const brandNames = brandLinks
              .map((link) => brandNameById.get(link.brandId))
              .filter(Boolean)
              .map(titleCase);

            const categoryNames = categoryLinks
              .map((link) => categoryNameById.get(link.categoryId))
              .filter(Boolean)
              .map(titleCase);

            const sortedImages = [...imageRecords].sort((a, b) => {
              const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 9999;
              const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 9999;
              return aOrder - bOrder;
            });

            const manualImages = sortedImages.filter(
              (image) => image.sourceType === 'manual' && image.isVisible !== false
            );
            const printfulImages = sortedImages.filter(
              (image) => image.sourceType === 'printful' && image.isVisible !== false
            );

            const candidates = manualImages.length ? manualImages : printfulImages;

            const primaryImage =
              candidates.find((image) => image.isFeatured && normalizeText(image.url)) ||
              candidates.find((image) => image.isPrimary && normalizeText(image.url)) ||
              candidates.find((image) => normalizeText(image.url));

            const sourceType = normalizeText(product.sourceType).toLowerCase() || 'other';
            const status = normalizeText(product.status).toLowerCase() || 'inactive';

            return {
              ...product,
              title: normalizeText(product.title) || 'Untitled product',
              slug: normalizeText(product.slug),
              displayPrice: normalizeText(product.displayPrice),
              sourceType,
              sourceLabel: sourceType ? titleCase(sourceType) : 'Other',
              sourceTypeClass: `source-${sourceType}`,
              statusLabel: titleCase(status),
              statusClass: `status-${status}`,
              brandNames,
              categoryNames,
              variantCount: Number(product.variantCount) || variantRecords.length,
              imageCount: sortedImages.length,
              hasPrimaryImage: Boolean(primaryImage),
              thumbnailKey: normalizeText(primaryImage?.url), // raw key for getUrl
              isVisible: product.isVisible === true,
              shortDescription: normalizeText(product.shortDescription),
              description: normalizeText(product.description),
              materials: normalizeText(product.materials),
              sizeGuide: normalizeText(product.sizeGuide),
              shippingReturns: normalizeText(product.shippingReturns),
              whatsIncluded: normalizeText(product.whatsIncluded),
              careInstructions: normalizeText(product.careInstructions),
              fitNotes: normalizeText(product.fitNotes),
            };
          })
          .sort((a, b) => {
            const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 9999;
            const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 9999;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.title.localeCompare(b.title);
          });

        // If you want thumbnails pre-resolved for the admin table:
        // for (const product of this.products) {
        //   if (product.thumbnailKey) {
        //     const urlResult = await getUrl({
        //       key: product.thumbnailKey,
        //       options: { expiresIn: 3600 },
        //     });
        //     product.thumbnail = urlResult.url.toString();
        //   }
        // }
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to load products.';
      } finally {
        this.loadingProducts = false;
      }
    },

    openProductModal(product) {
      const brandLinks = this.productBrands.filter((link) => link.productId === product.id);
      const categoryLinks = this.productCategories.filter((link) => link.productId === product.id);

      this.selectedProductId = product.id;
      this.productModal = product;
      this.productForm = {
        id: product.id,
        title: product.title || '',
        slug: product.slug || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        materials: product.materials || '',
        sizeGuide: product.sizeGuide || '',
        shippingReturns: product.shippingReturns || '',
        whatsIncluded: product.whatsIncluded || '',
        careInstructions: product.careInstructions || '',
        fitNotes: product.fitNotes || '',
        status: normalizeText(product.status) || 'active',
        isVisible: product.isVisible === true,
        brandIds: brandLinks.map((link) => link.brandId),
        categoryIds: categoryLinks.map((link) => link.categoryId),
        sourceType: product.sourceLabel || product.sourceType || '',
        displayPrice: product.displayPrice || '',
        variantCount: product.variantCount || 0,
        imageCount: product.imageCount || 0,
      };
    },

    closeProductModal() {
      this.productModal = null;
      this.selectedProductId = '';
    },

    async saveProduct() {
      if (!this.productForm.id) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        const payload = {
          id: this.productForm.id,
          title: normalizeText(this.productForm.title),
          slug: normalizeText(this.productForm.slug),
          shortDescription: normalizeText(this.productForm.shortDescription),
          description: normalizeText(this.productForm.description),
          materials: normalizeText(this.productForm.materials),
          sizeGuide: normalizeText(this.productForm.sizeGuide),
          shippingReturns: normalizeText(this.productForm.shippingReturns),
          whatsIncluded: normalizeText(this.productForm.whatsIncluded),
          careInstructions: normalizeText(this.productForm.careInstructions),
          fitNotes: normalizeText(this.productForm.fitNotes),
          status: normalizeText(this.productForm.status) || 'active',
          isVisible: this.productForm.isVisible === true,
        };

        const updateResult = await getModelOrThrow('MerchProduct').update(payload, {
          authMode: 'userPool',
        });

        if (updateResult.errors?.length) {
          throw new Error(updateResult.errors[0].message || 'Failed to save product.');
        }

        const existingBrandLinks = this.productBrands.filter(
          (link) => link.productId === this.productForm.id
        );
        const existingCategoryLinks = this.productCategories.filter(
          (link) => link.productId === this.productForm.id
        );

        for (const link of existingBrandLinks) {
          await getModelOrThrow('MerchProductBrand').delete(
            { id: link.id },
            { authMode: 'userPool' }
          );
        }

        for (const link of existingCategoryLinks) {
          await getModelOrThrow('MerchProductCategory').delete(
            { id: link.id },
            { authMode: 'userPool' }
          );
        }

        for (const brandId of this.productForm.brandIds || []) {
          const brandCreate = await getModelOrThrow('MerchProductBrand').create(
            {
              productId: this.productForm.id,
              brandId,
            },
            { authMode: 'userPool' }
          );

          if (brandCreate.errors?.length) {
            throw new Error(brandCreate.errors[0].message || 'Failed to save brand assignment.');
          }
        }

        for (const categoryId of this.productForm.categoryIds || []) {
          const categoryCreate = await getModelOrThrow('MerchProductCategory').create(
            {
              productId: this.productForm.id,
              categoryId,
            },
            { authMode: 'userPool' }
          );

          if (categoryCreate.errors?.length) {
            throw new Error(
              categoryCreate.errors[0].message || 'Failed to save category assignment.'
            );
          }
        }

        makeToast(this, 'Product updated');
        this.closeProductModal();
        await this.loadProducts();
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to save product.';
      } finally {
        this.savingProduct = false;
      }
    },

    // 8. Methods: media management (view/update/delete) with signed URLs

    async openMediaModal(product) {
      const images = this.productImages.filter(
        (image) => normalizeText(image.productId) === normalizeText(product.id)
      );

      this.selectedProductId = product.id;
      this.selectedProductImages = images;

      this.mediaForm = {
        featuredImageId: images.find((img) => img.isFeatured)?.id || '',
        visibleImageIds: images
          .filter((img) => img.isVisible !== false)
          .map((img) => img.id),
      };

      // Resolve signed URLs from keys
      for (const image of this.selectedProductImages) {
        const key = normalizeText(image.url);
        if (!key) continue;

        try {
          const urlResult = await getUrl({
            key,
            options: { expiresIn: 3600 }, // 1 hour for admin viewing
          });
          image.signedUrl = urlResult.url.toString();
        } catch (e) {
          console.error('Failed to resolve media URL', e);
          image.signedUrl = '';
        }
      }

      this.mediaModalOpen = true;
    },

    closeMediaModal() {
      this.mediaModalOpen = false;
      this.selectedProductImages = [];
      this.mediaForm = {
        featuredImageId: '',
        visibleImageIds: [],
      };
      this.mediaUploadFiles = [];
    },

    async saveMediaChanges() {
      if (!this.selectedProductId) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        for (const image of this.selectedProductImages) {
          const isVisible = this.mediaForm.visibleImageIds.includes(image.id);
          const isFeatured = this.mediaForm.featuredImageId === image.id;

          const updateResult = await getModelOrThrow('MerchProductImage').update(
            {
              id: image.id,
              isVisible,
              isFeatured,
              color: normalizeText(image.color),
              colorHex: normalizeText(image.colorHex),
            },
            { authMode: 'userPool' }
          );

          if (updateResult.errors?.length) {
            throw new Error(updateResult.errors[0].message || 'Failed to save image settings.');
          }
        }

        makeToast(this, 'Media updated');
        this.closeMediaModal();
        await this.loadProducts();
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to save media settings.';
      } finally {
        this.savingProduct = false;
      }
    },

    async deleteImage(imageId) {
      if (!imageId) return;

      try {
        const deleteResult = await getModelOrThrow('MerchProductImage').delete(
          { id: imageId },
          { authMode: 'userPool' }
        );

        if (deleteResult.errors?.length) {
          throw new Error(deleteResult.errors[0].message || 'Failed to delete image.');
        }

        this.selectedProductImages = this.selectedProductImages.filter(
          (img) => img.id !== imageId
        );
        this.mediaForm.visibleImageIds = this.mediaForm.visibleImageIds.filter(
          (id) => id !== imageId
        );
        if (this.mediaForm.featuredImageId === imageId) {
          this.mediaForm.featuredImageId = '';
        }
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to delete image.';
      }
    },

    // 9. Methods: media upload (file input, upload to Storage, create MerchProductImage)

    handleMediaFileChange(event) {
      const files = Array.from(event.target.files || []);
      this.mediaUploadFiles = files;
    },

    async uploadMediaFiles() {
      if (!this.selectedProductId || !this.mediaUploadFiles.length) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        const hadImages = this.selectedProductImages.length > 0;

        for (const file of this.mediaUploadFiles) {
          const key = await this.uploadFileToStorage(file);

          const createResult = await getModelOrThrow('MerchProductImage').create(
            {
              productId: this.selectedProductId,
              url: key, // raw key
              altText: file.name,
              sortOrder: this.selectedProductImages.length,
              sourceType: 'manual',
              isVisible: true,
              isFeatured: !hadImages && this.selectedProductImages.length === 0,
            },
            { authMode: 'userPool' }
          );

          if (createResult.errors?.length) {
            throw new Error(
              createResult.errors[0].message || 'Failed to create mockup image.'
            );
          }

          const newImage = createResult.data;
          this.selectedProductImages.push(newImage);
          this.mediaForm.visibleImageIds.push(newImage.id);

          if (newImage.isFeatured) {
            this.mediaForm.featuredImageId = newImage.id;
          }
        }

        this.mediaUploadFiles = [];
        makeToast(this, 'Mockup images uploaded');

        await this.loadProducts();
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to upload mockup images.';
      } finally {
        this.savingProduct = false;
      }
    },

    async uploadFileToStorage(file) {
      if (!file) {
        throw new Error('No file provided for upload.');
      }
      if (!this.selectedProductId) {
        throw new Error('No selected productId for upload.');
      }

      const fileName = file.name || 'file';
      const safeName = fileName.replace(/\s+/g, '-');

      // Write under products/<productId>/..., letting accessLevel handle public prefix
      const key = `products/${this.selectedProductId}/${Date.now()}-${safeName}`;

      const uploadTask = uploadData({
        key,
        data: file,
        options: {
          accessLevel: 'public', // public images for merch storefront
          contentType: file.type || 'application/octet-stream',
        },
      });

      await uploadTask.result; // ensure upload completes [web:31][web:19]

      return key;
    },
  },
};