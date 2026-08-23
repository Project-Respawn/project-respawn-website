import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import outputs from '../../../../amplify_outputs.json';
import { fetchProducts, fetchProductById } from '../../Merch/merchService';
import { refreshAccessContext } from '@/composables/useAccessContext.js';
import { filterProductsForProductControl, getProductControlCapabilities } from './ProductControl.access.js';
import { findExistingPrintfulVariant, printfulSyncVariantId } from '@/commerce/printfulVariant.js';

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
      `Amplify model "${modelName}" is unavailable. Available models: ${Object.keys(models).join(', ')}`
    );
  }

  return model;
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

function isBlobUrl(value) {
  const text = normalizeText(value);
  return /^blob:/i.test(text);
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

function normalizePrintfulVariant(variant) {
  const retailPrice = inferPriceNumber(
    variant?.retail_price,
    variant?.retailPrice,
    variant?.price,
    variant?.sync_variant?.retail_price
  );

  return {
    id: normalizeText(variant?.id),
    externalVariantId: printfulSyncVariantId(variant),
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

function makeToast(vm, message) {
  vm.toastMessage = message;
  window.clearTimeout(vm.toastTimeout);
  vm.toastTimeout = window.setTimeout(() => {
    vm.toastMessage = '';
  }, 3000);
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

  if (/^media\//i.test(withoutLeadingSlash)) {
    return `public/${withoutLeadingSlash}`;
  }

  if (/^products\//i.test(withoutLeadingSlash)) {
    return `public/media/${withoutLeadingSlash}`;
  }

  return `public/media/${withoutLeadingSlash}`;
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

function getStoragePathForDelete(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  if (isRemoteUrl(cleanValue)) {
    const extracted = extractStoragePathFromUrl(cleanValue);
    if (/^(public|protected|private)\//i.test(extracted)) {
      return extracted;
    }
    return '';
  }

  if (/^\/?images\//i.test(cleanValue)) {
    return '';
  }

  return normalizeStoragePath(cleanValue);
}

async function listAllModelRecords(modelName, authMode = 'userPool') {
  const model = getModelOrThrow(modelName);
  const records = [];
  let nextToken;

  do {
    const listResult = await model.list({
      authMode,
      nextToken,
      limit: 1000,
    });

    if (listResult.errors?.length) {
      throw new Error(listResult.errors[0].message || `Failed to list ${modelName}.`);
    }

    records.push(...(listResult.data || []));
    nextToken = listResult.nextToken;
  } while (nextToken);

  return records;
}

function uniqueIds(values = []) {
  return [...new Set(values.map(normalizeText).filter(Boolean))];
}

function buildFolderTree(collections) {
  const nodes = (collections || []).map((collection) => ({
    ...collection,
    children: [],
  }));

  const lookup = new Map(nodes.map((node) => [node.id, node]));
  const roots = [];

  for (const node of nodes) {
    if (node.parentId == null) {
      roots.push(node);
      continue;
    }

    const parent = lookup.get(node.parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function buildFolderPath(collections, folderId) {
  const path = [];
  if (!folderId) return path;

  const byId = new Map((collections || []).map((collection) => [collection.id, collection]));
  let node = byId.get(folderId);

  while (node) {
    path.unshift(node);
    if (!node.parentId) break;
    node = byId.get(node.parentId);
  }

  return path;
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
    console.warn('Failed to resolve storage URL for value:', cleanValue);
    return publicUrl;
  }
}

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
      accessContext: { groups: [], brands: [] },
      selectedBrandId: '',
      accessLoading: false,

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
        thumbnailUrl: '',
        imageUrl: '',
        externalProductId: '',
        externalVariantGroupId: '',
        sku: '',
        basePrice: null,
        currency: '',
        productUrl: '',
        sortOrder: 0,
      },

      mediaModalOpen: false,
      selectedProductImages: [],
      selectedMediaIndex: 0,
      mediaForm: {
        primaryImageId: '',
        featuredImageId: '',
        visibleImageIds: [],
      },

      mediaUploadFiles: [],
      mediaCollections: [],
      mediaLibraryItems: [],
      mediaLibraryFolderTree: [],
      mediaLibraryCurrentFolderId: null,
      mediaLibraryCurrentFolderPath: [],
      librarySearchQuery: '',
    };
  },

  computed: {
    visibleProductsCount() {
      return this.accessibleProducts.filter((product) => product.isVisible).length;
    },

    printfulProductsCount() {
      return this.accessibleProducts.filter((product) => product.sourceType === 'printful').length;
    },

    productControlCapabilities() {
      return getProductControlCapabilities(this.accessContext, this.selectedBrandId);
    },

    isPlatformOperator() {
      return this.productControlCapabilities.isPlatformOperator;
    },

    canManageProductRelationships() {
      return this.productControlCapabilities.canManageRelationships;
    },

    accessibleBrandOptions() {
      return this.accessContext.brands || [];
    },

    accessibleProducts() {
      return filterProductsForProductControl(
        this.products,
        this.productBrands,
        this.productControlCapabilities,
        this.selectedBrandId
      );
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

      return this.accessibleProducts.filter((product) => {
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

    activeMediaImage() {
      return this.selectedProductImages[this.selectedMediaIndex] || {};
    },

    mediaLibraryFolderRows() {
      const rows = [];

      const walk = (nodes, depth) => {
        for (const node of nodes) {
          rows.push({ ...node, depth });
          if (node.children?.length) {
            walk(node.children, depth + 1);
          }
        }
      };

      walk(this.mediaLibraryFolderTree, 0);
      return rows;
    },

    mediaLibraryCurrentFolder() {
      if (!this.mediaLibraryCurrentFolderId) return null;
      return this.mediaCollections.find((collection) => collection.id === this.mediaLibraryCurrentFolderId) || null;
    },

    mediaItemsInCurrentLibraryFolder() {
      const usableItems = this.mediaLibraryItems.filter((item) => !isBlobUrl(item.url));

      if (!this.mediaLibraryCurrentFolderId) {
        return usableItems;
      }

      return usableItems.filter(
        (item) => normalizeText(item.collectionId) === normalizeText(this.mediaLibraryCurrentFolderId)
      );
    },

    filteredLibraryMediaItems() {
      const query = normalizeText(this.librarySearchQuery).toLowerCase();
      const attachedMediaIds = this.selectedProductMediaIds;

      return this.mediaItemsInCurrentLibraryFolder.filter((item) => {
        if (!query) return true;

        const haystack = [
          item.title,
          item.altText,
          item.type,
          item.sourceType,
          item.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });
    },

    selectedProductMediaIds() {
      return new Set(
        this.selectedProductImages
          .map((image) => normalizeText(image.mediaItemId || image.id))
          .filter(Boolean)
      );
    },
  },

  async mounted() {
    await this.loadAccessContext();
    await this.loadProducts();
  },

  beforeUnmount() {
    window.clearTimeout(this.toastTimeout);
  },

  methods: {
    async loadAccessContext() {
      this.accessLoading = true;
      try {
        const context = await refreshAccessContext();
        this.accessContext = context;
        if (!getProductControlCapabilities(context, '').isPlatformOperator) {
          this.selectedBrandId = context.brands?.some((brand) => brand.brandId === this.selectedBrandId)
            ? this.selectedBrandId
            : context.brands?.[0]?.brandId || '';
        }
      } catch (error) {
        this.accessContext = { groups: [], brands: [] };
        this.selectedBrandId = '';
        this.loadError = error?.message || 'Unable to load product access.';
      } finally {
        this.accessLoading = false;
      }
    },

    async selectBrandContext() {
      await this.loadProducts();
    },

    canEditProduct(product) {
      if (this.isPlatformOperator) return true;
      return this.productControlCapabilities.canEditScalarProduct && this.productBrands.some(
        (link) => link.productId === product.id && link.brandId === this.selectedBrandId
      );
    },

    assertPlatformMediaAccess() {
      if (!this.productControlCapabilities.canManageMedia) {
        throw new Error('Only platform staff can manage product media.');
      }
    },

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

      const [existingProductsResult, existingVariantsResult] = await Promise.all([
        getModelOrThrow('MerchProduct').list({ authMode: 'userPool' }),
        getModelOrThrow('MerchProductVariant').list({ authMode: 'userPool' }),
      ]);

      const firstExistingError = [
        existingProductsResult,
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
          const createResult = await getClient().mutations.createManagedMerchProduct(payload);

          if (createResult.errors?.length) {
            throw new Error(createResult.errors[0].message || `Failed to create ${title}.`);
          }

          productId = createResult.data?.productId || '';
        } else {
          const updateResult = await getClient().mutations.updateManagedMerchProduct({
            productId: existing.id,
            ...payload,
          });

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

          if (!variant.externalVariantId) throw new Error(`Printful variant ${variant.name || variantIndex + 1} has no sync variant ID`);
          const existingVariant = existingVariantByExternalId.get(variant.externalVariantId) || findExistingPrintfulVariant(existingVariantsForProduct, variant);

          const variantResult = await getClient().mutations.upsertManagedMerchProductVariant({
            ...(existingVariant ? { variantId: existingVariant.id } : {}),
            ...variantPayload,
          });

          if (variantResult.errors?.length) {
            throw new Error(
              variantResult.errors[0].message || `Failed to save variant for ${title}.`
            );
          }
        }
      }
    },

    async loadProducts() {
      this.loadingProducts = true;
      this.loadError = '';

      try {
        const managedMediaResult = this.productControlCapabilities.canManageMedia
          ? await getClient().queries.listManagedMediaLibrary()
          : { data: { mediaItems: [], collections: [] }, errors: [] };
        if (managedMediaResult.errors?.length) {
          throw new Error(managedMediaResult.errors[0].message || 'Failed to load Media Library.');
        }
        const managedMedia = managedMediaResult.data || { mediaItems: [], collections: [] };
        const [
          products,
          brands,
          categories,
          productBrands,
          productCategories,
          productImages,
          productVariants,
          mediaItems,
          mediaCollections,
        ] = await Promise.all([
          listAllModelRecords('MerchProduct'),
          listAllModelRecords('Brand'),
          listAllModelRecords('MerchCategory'),
          listAllModelRecords('MerchProductBrand'),
          listAllModelRecords('MerchProductCategory'),
          this.productControlCapabilities.canManageMedia ? listAllModelRecords('MerchProductImage') : Promise.resolve([]),
          listAllModelRecords('MerchProductVariant'),
          Promise.resolve(managedMedia.mediaItems || []),
          Promise.resolve(managedMedia.collections || []),
        ]);

        this.brands = brands;
        this.categories = categories;
        this.productBrands = productBrands;
        this.productCategories = productCategories;
        this.productVariants = productVariants;
        this.mediaLibraryItems = mediaItems.map((item) => ({ ...item }));
        this.mediaCollections = mediaCollections.map((collection) => ({ ...collection }));
        this.mediaLibraryFolderTree = buildFolderTree(this.mediaCollections);
        this.mediaLibraryCurrentFolderPath = buildFolderPath(
          this.mediaCollections,
          this.mediaLibraryCurrentFolderId
        );

        const mediaItemsById = new Map(
          this.mediaLibraryItems.map((item) => [normalizeText(item.id), item])
        );
        this.productImages = productImages.map((image) => {
          const mediaItem = mediaItemsById.get(normalizeText(image.mediaItemId));

          return {
            ...image,
            url: normalizeText(mediaItem?.url) || normalizeText(image.url) || '',
            altText: normalizeText(mediaItem?.altText) || normalizeText(image.altTextOverride) || '',
            color: normalizeText(image.colorOverride) || normalizeText(mediaItem?.color) || '',
            colorHex: normalizeText(image.colorHexOverride) || normalizeText(mediaItem?.colorHex) || '',
            title: normalizeText(mediaItem?.title) || '',
            type: normalizeText(mediaItem?.type) || '',
            sourceType: normalizeText(mediaItem?.sourceType) || '',
            status: normalizeText(image.status) || normalizeText(mediaItem?.status) || '',
            isVisible: image.isVisible !== false,
            isFeatured: image.isFeatured === true,
          };
        });

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

        const mappedProducts = products
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
              if ((a.isPrimary ? 1 : 0) !== (b.isPrimary ? 1 : 0)) {
                return a.isPrimary ? -1 : 1;
              }
              if ((a.isFeatured ? 1 : 0) !== (b.isFeatured ? 1 : 0)) {
                return a.isFeatured ? -1 : 1;
              }
              const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 9999;
              const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 9999;
              return aOrder - bOrder;
            });

            const visibleImages = sortedImages.filter(
              (image) => image.isVisible !== false && normalizeText(image.url)
            );

            const primaryImage =
              visibleImages.find((image) => image.isPrimary) ||
              visibleImages.find((image) => image.isFeatured) ||
              visibleImages[0] ||
              null;

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
              primaryImageId: primaryImage?.id || '',
              thumbnailSource: normalizeText(primaryImage?.url),
              thumbnail: '',
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

        await Promise.all(
          mappedProducts.map(async (product) => {
            product.thumbnail = await resolveStorageUrl(product.thumbnailSource);
          })
        );

        this.products = mappedProducts;
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
        sourceType: product.sourceType || '',
        displayPrice: product.displayPrice || '',
        variantCount: product.variantCount || 0,
        imageCount: product.imageCount || 0,
        thumbnailUrl: product.thumbnailUrl || '',
        imageUrl: product.imageUrl || '',
        externalProductId: product.externalProductId || '',
        externalVariantGroupId: product.externalVariantGroupId || '',
        sku: product.sku || '',
        basePrice: product.basePrice ?? null,
        currency: product.currency || '',
        productUrl: product.productUrl || '',
        sortOrder: product.sortOrder ?? 0,
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
        if (!this.canEditProduct(this.productModal || { id: this.productForm.id })) {
          throw new Error('You do not have permission to edit this product in the selected Brand context.');
        }

        const payload = {
          productId: this.productForm.id,
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

        if (this.isPlatformOperator) {
          Object.assign(payload, {
            thumbnailUrl: normalizeText(this.productForm.thumbnailUrl),
            imageUrl: normalizeText(this.productForm.imageUrl),
            sourceType: normalizeText(this.productForm.sourceType),
            externalProductId: normalizeText(this.productForm.externalProductId),
            externalVariantGroupId: normalizeText(this.productForm.externalVariantGroupId),
            sku: normalizeText(this.productForm.sku),
            displayPrice: normalizeText(this.productForm.displayPrice),
            basePrice: this.productForm.basePrice === '' || this.productForm.basePrice == null
              ? null
              : Number(this.productForm.basePrice),
            currency: normalizeText(this.productForm.currency),
            productUrl: normalizeText(this.productForm.productUrl),
            variantCount: Number(this.productForm.variantCount) || 0,
            sortOrder: Number(this.productForm.sortOrder) || 0,
          });
        } else {
          payload.brandId = this.selectedBrandId;
        }

        const updateResult = await getClient().mutations.updateManagedMerchProduct(payload);

        if (updateResult.errors?.length) {
          throw new Error(updateResult.errors[0].message || 'Failed to save product.');
        }

        if (this.isPlatformOperator) {
          const [brandResult, categoryResult] = await Promise.all([
            getClient().mutations.replaceManagedMerchProductBrands({
              productId: this.productForm.id,
              brandIds: uniqueIds(this.productForm.brandIds),
            }),
            getClient().mutations.replaceManagedMerchProductCategories({
              productId: this.productForm.id,
              categoryIds: uniqueIds(this.productForm.categoryIds),
            }),
          ]);
          const relationshipError = brandResult.errors?.[0] || categoryResult.errors?.[0];
          if (relationshipError) throw new Error(relationshipError.message || 'Failed to save product assignments.');
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

    async openMediaModal(product, options = {}) {
      this.assertPlatformMediaAccess();
      const {
        preserveLibraryState = false,
        focusMediaItemId = '',
      } = options;

      const images = this.productImages
        .filter((image) => normalizeText(image.productId) === normalizeText(product.id))
        .sort((a, b) => {
          const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 9999;
          const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 9999;
          return aOrder - bOrder;
        });

      const resolvedImages = await Promise.all(
        images.map(async (image) => ({
          ...image,
          signedUrl: await resolveStorageUrl(image.url),
        }))
      );

      this.selectedProductId = product.id;
      this.selectedProductImages = resolvedImages;

      const focusedIndex = focusMediaItemId
        ? resolvedImages.findIndex(
            (image) => normalizeText(image.mediaItemId) === normalizeText(focusMediaItemId)
          )
        : -1;

      this.selectedMediaIndex = focusedIndex >= 0
        ? focusedIndex
        : Math.max(
            0,
            resolvedImages.findIndex((image) => image.isPrimary || image.isFeatured)
          );

      this.mediaForm = {
        primaryImageId: resolvedImages.find((img) => img.isPrimary)?.id || resolvedImages.find((img) => img.isFeatured)?.id || '',
        featuredImageId: resolvedImages.find((img) => img.isFeatured)?.id || '',
        visibleImageIds: resolvedImages
          .filter((img) => img.isVisible !== false)
          .map((img) => img.id),
      };

      if (!preserveLibraryState) {
        this.selectAllLibraryMedia();
        this.librarySearchQuery = '';
      }

      this.mediaModalOpen = true;
    },

    async refreshMediaModalFromServer(options = {}) {
      const {
        focusMediaItemId = '',
      } = options;

      await this.loadProducts();

      const currentProduct = this.products.find(
        (product) => normalizeText(product.id) === normalizeText(this.selectedProductId)
      );

      if (currentProduct) {
        await this.openMediaModal(currentProduct, {
          preserveLibraryState: true,
          focusMediaItemId,
        });
      }
    },

    closeMediaModal() {
      this.mediaModalOpen = false;
      this.selectedProductImages = [];
      this.selectedMediaIndex = 0;
      this.mediaForm = {
        primaryImageId: '',
        featuredImageId: '',
        visibleImageIds: [],
      };
      this.mediaUploadFiles = [];
      this.selectAllLibraryMedia();
    },

    selectAllLibraryMedia() {
      this.mediaLibraryCurrentFolderId = null;
      this.mediaLibraryCurrentFolderPath = [];
    },

    handleLibraryFolderSelect(folder) {
      if (!folder?.id) return;

      this.mediaLibraryCurrentFolderId = folder.id;
      this.mediaLibraryCurrentFolderPath = buildFolderPath(this.mediaCollections, folder.id);
    },

    handleLibraryBreadcrumbClick(folder) {
      if (!folder?.id) return;

      this.mediaLibraryCurrentFolderId = folder.id;
      this.mediaLibraryCurrentFolderPath = buildFolderPath(this.mediaCollections, folder.id);
    },

    collectionMediaCount(collectionId) {
      if (!collectionId) return 0;
      return this.mediaLibraryItems.filter(
        (item) =>
          !isBlobUrl(item.url) &&
          normalizeText(item.collectionId) === normalizeText(collectionId)
      ).length;
    },

    async createLibraryFolder() {
      this.assertPlatformMediaAccess();
      const name = window.prompt('New folder name');
      if (!name) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        const createResult = await getClient().mutations.createManagedMediaCollection(
          {
            name,
            slug: slugify(name) || `collection-${Date.now()}`,
            parentId: this.mediaLibraryCurrentFolderId || null,
            type: 'folder',
            sortOrder: this.mediaCollections.length,
            isActive: true,
          }
        );

        if (createResult.errors?.length) {
          throw new Error(createResult.errors[0].message || 'Failed to create folder.');
        }

        await this.loadProducts();
        this.mediaLibraryCurrentFolderId = createResult.data?.mediaItemId || this.mediaLibraryCurrentFolderId;
        this.mediaLibraryCurrentFolderPath = buildFolderPath(
          this.mediaCollections,
          this.mediaLibraryCurrentFolderId
        );
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to create folder.';
      } finally {
        this.savingProduct = false;
      }
    },

    async moveLibraryMediaItemToCurrentFolder(item) {
      this.assertPlatformMediaAccess();
      if (!item?.id) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        const updateResult = await getClient().mutations.updateManagedMediaItem(
          {
            mediaItemId: item.id,
            collectionId: this.mediaLibraryCurrentFolderId || null,
          }
        );

        if (updateResult.errors?.length) {
          throw new Error(updateResult.errors[0].message || 'Failed to move media item.');
        }

        await this.loadProducts();
        this.mediaLibraryCurrentFolderPath = buildFolderPath(
          this.mediaCollections,
          this.mediaLibraryCurrentFolderId
        );
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to move media item.';
      } finally {
        this.savingProduct = false;
      }
    },

    async deleteLibraryMediaItem(item) {
      this.assertPlatformMediaAccess();
      if (!item?.id) return;

      const confirmed = window.confirm('Delete this media asset from the library? This also removes it from linked products.');
      if (!confirmed) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        await this.hardDeleteMediaAsset(item.id, item.url);

        makeToast(this, 'Media asset permanently deleted');
        await this.loadProducts();
        this.mediaLibraryCurrentFolderPath = buildFolderPath(
          this.mediaCollections,
          this.mediaLibraryCurrentFolderId
        );
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to delete media asset.';
      } finally {
        this.savingProduct = false;
      }
    },

    async hardDeleteMediaAsset(mediaItemId, fallbackUrl = '') {
      this.assertPlatformMediaAccess();
      const normalizedMediaItemId = normalizeText(mediaItemId);
      if (!normalizedMediaItemId) return;

      const allLinks = await listAllModelRecords('MerchProductImage', 'userPool');

      const linkedImages = allLinks.filter(
        (link) => normalizeText(link.mediaItemId) === normalizedMediaItemId
      );

      for (const link of linkedImages) {
        const linkDeleteResult = await getClient().mutations.deleteManagedMerchProductImage({ imageId: link.id });

        if (linkDeleteResult.errors?.length) {
          throw new Error(linkDeleteResult.errors[0].message || 'Failed to remove product image link.');
        }
      }

      const mediaItem = this.mediaLibraryItems.find(
        (item) => normalizeText(item.id) === normalizedMediaItemId
      );

      if (mediaItem) {
        const mediaDeleteResult = await getClient().mutations.deleteManagedMediaItem({ mediaItemId: normalizedMediaItemId });

        if (mediaDeleteResult.errors?.length) {
          throw new Error(mediaDeleteResult.errors[0].message || 'Failed to delete media asset.');
        }
      }

      const storagePath = getStoragePathForDelete(mediaItem?.url || fallbackUrl);
      if (storagePath) {
        try {
          await remove({
            path: storagePath,
            options: {
              accessLevel: 'public',
            },
          });
        } catch (storageError) {
          console.warn('Media record deleted, but failed to remove storage object:', storagePath, storageError);
        }
      }
    },

    async deleteProductImageCluster(targetImage) {
      this.assertPlatformMediaAccess();
      if (!targetImage?.id) return;

      const targetId = normalizeText(targetImage.id);
      const targetProductId = normalizeText(this.selectedProductId || targetImage.productId);
      const targetMediaItemId = normalizeText(targetImage.mediaItemId);
      const targetUrl = normalizeText(targetImage.url);

      const productSiblings = this.productImages.filter(
        (image) => normalizeText(image.productId) === targetProductId
      );

      const siblingLinkIds = new Set();
      siblingLinkIds.add(targetId);

      for (const sibling of productSiblings) {
        const siblingId = normalizeText(sibling.id);
        if (!siblingId || siblingId === targetId) continue;

        const sameMediaItem =
          targetMediaItemId && normalizeText(sibling.mediaItemId) === targetMediaItemId;

        const sameUrl =
          targetUrl && normalizeText(sibling.url) === targetUrl;

        if (sameMediaItem || sameUrl) {
          siblingLinkIds.add(siblingId);
        }
      }

      for (const linkId of siblingLinkIds) {
        const deleteResult = await getClient().mutations.deleteManagedMerchProductImage({ imageId: linkId });

        if (deleteResult.errors?.length) {
          throw new Error(deleteResult.errors[0].message || 'Failed to delete product image link.');
        }
      }

      if (targetMediaItemId) {
        await this.hardDeleteMediaAsset(targetMediaItemId, targetUrl);
      }

      if (targetUrl) {
        const matchingMediaItems = this.mediaLibraryItems.filter(
          (item) => normalizeText(item.url) === targetUrl
        );

        for (const mediaItem of matchingMediaItems) {
          const mediaItemId = normalizeText(mediaItem.id);
          if (!mediaItemId || mediaItemId === targetMediaItemId) continue;
          await this.hardDeleteMediaAsset(mediaItemId, mediaItem.url);
        }
      }
    },

    prevMediaImage() {
      if (this.selectedMediaIndex > 0) {
        this.selectedMediaIndex -= 1;
      }
    },

    nextMediaImage() {
      if (this.selectedMediaIndex < this.selectedProductImages.length - 1) {
        this.selectedMediaIndex += 1;
      }
    },

    setPrimaryMediaImage(imageId) {
      if (!imageId) return;

      this.mediaForm.primaryImageId = imageId;
      const nextIndex = this.selectedProductImages.findIndex((image) => image.id === imageId);
      if (nextIndex >= 0) {
        this.selectedMediaIndex = nextIndex;
      }
    },

    async saveMediaChanges() {
      this.assertPlatformMediaAccess();
      if (!this.selectedProductId) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        for (const image of this.selectedProductImages) {
          const isVisible = this.mediaForm.visibleImageIds.includes(image.id);
          const isPrimary = this.mediaForm.primaryImageId === image.id;
          const isFeatured = this.mediaForm.featuredImageId === image.id || isPrimary;

          const merchImageUpdateResult = await getClient().mutations.upsertManagedMerchProductImage({
              imageId: image.id,
              productId: this.selectedProductId,
              isVisible,
              isFeatured,
              isPrimary,
              isMockup: true,
          });

          if (merchImageUpdateResult.errors?.length) {
            throw new Error(
              merchImageUpdateResult.errors[0].message || 'Failed to save image settings.'
            );
          }

          if (image.mediaItemId) {
            const mediaItemUpdateResult = await getClient().mutations.updateManagedMediaItem(
              {
                mediaItemId: image.mediaItemId,
                altText: normalizeText(image.altText),
                color: normalizeText(image.color),
                colorHex: normalizeText(image.colorHex),
              }
            );

            if (mediaItemUpdateResult.errors?.length) {
              throw new Error(
                mediaItemUpdateResult.errors[0].message || 'Failed to save image metadata.'
              );
            }
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
      this.assertPlatformMediaAccess();
      if (!imageId) return;

      const targetImage = this.selectedProductImages.find((img) => img.id === imageId);
      if (!targetImage) return;

      try {
        await this.deleteProductImageCluster(targetImage);

        await this.refreshMediaModalFromServer();
        makeToast(this, 'Image permanently deleted');
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to delete image.';
      }
    },

    handleMediaFileChange(event) {
      const files = Array.from(event.target.files || []);
      this.mediaUploadFiles = files;
    },

    async uploadMediaFiles() {
      this.assertPlatformMediaAccess();
      if (!this.selectedProductId || !this.mediaUploadFiles.length) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        let currentImageCount = this.selectedProductImages.length;

        for (const file of this.mediaUploadFiles) {
          const imageUrl = await this.uploadFileToStorage(file);

          const mediaItemCreateResult = await getClient().mutations.createManagedMediaItem(
            {
              url: imageUrl,
              title: file.name,
              altText: file.name,
              type: file.type || 'image',
              sourceType: 'manual',
              status: 'active',
            }
          );

          if (mediaItemCreateResult.errors?.length) {
            throw new Error(mediaItemCreateResult.errors[0].message || 'Failed to create media library item.');
          }

          const createResult = await getClient().mutations.upsertManagedMerchProductImage({
              productId: this.selectedProductId,
              mediaItemId: mediaItemCreateResult.data?.mediaItemId,
              sortOrder: currentImageCount,
              isVisible: true,
              isFeatured: currentImageCount === 0,
                isPrimary: currentImageCount === 0,
              isPrimary: currentImageCount === 0,
              altTextOverride: file.name,
              colorOverride: '',
              colorHexOverride: '',
              status: 'active',
            });

          if (createResult.errors?.length) {
            throw new Error(createResult.errors[0].message || 'Failed to create mockup image.');
          }

          const newImage = {
            ...createResult.data,
            ...mediaItemCreateResult.data,
            id: createResult.data?.id,
            mediaItemId: mediaItemCreateResult.data?.mediaItemId,
            url: imageUrl,
            altText: file.name,
            title: file.name,
            sourceType: 'manual',
            type: file.type || 'image',
            status: normalizeText(createResult.data?.status) || 'active',
            signedUrl: await resolveStorageUrl(imageUrl),
            isVisible: createResult.data?.isVisible !== false,
            isFeatured: createResult.data?.isFeatured === true,
          };

          this.selectedProductImages.push(newImage);
          this.mediaForm.visibleImageIds.push(newImage.id);

            if (newImage.isPrimary) {
              this.mediaForm.primaryImageId = newImage.id;
            }

          if (newImage.isFeatured) {
            this.mediaForm.featuredImageId = newImage.id;
          }

          currentImageCount += 1;
        }

        this.mediaUploadFiles = [];
        makeToast(this, 'Mockup images uploaded');
        await this.refreshMediaModalFromServer();
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to upload mockup images.';
      } finally {
        this.savingProduct = false;
      }
    },

    async attachLibraryMediaItem(mediaItem) {
      this.assertPlatformMediaAccess();
      if (!this.selectedProductId || !mediaItem?.id) return;

      this.savingProduct = true;
      this.loadError = '';

      try {
        const alreadyAttached = this.selectedProductImages.some(
          (image) => normalizeText(image.mediaItemId) === normalizeText(mediaItem.id)
        );

        if (alreadyAttached) {
          const existingIndex = this.selectedProductImages.findIndex(
            (image) => normalizeText(image.mediaItemId) === normalizeText(mediaItem.id)
          );
          if (existingIndex >= 0) {
            this.selectedMediaIndex = existingIndex;
          }
          makeToast(this, 'Image selected');
          return;
        }

        const currentImageCount = this.selectedProductImages.length;
        const createResult = await getClient().mutations.upsertManagedMerchProductImage({
            productId: this.selectedProductId,
            mediaItemId: mediaItem.id,
            sortOrder: currentImageCount,
            isVisible: true,
            isFeatured: currentImageCount === 0,
            isMockup: true,
            isPrimary: currentImageCount === 0,
            altTextOverride: normalizeText(mediaItem.altText),
            colorOverride: normalizeText(mediaItem.color),
            colorHexOverride: normalizeText(mediaItem.colorHex),
            status: 'active',
        });

        if (createResult.errors?.length) {
          throw new Error(createResult.errors[0].message || 'Failed to attach media library item.');
        }

        const newImage = {
          ...createResult.data,
          ...mediaItem,
          id: createResult.data?.id,
          mediaItemId: mediaItem.id,
          url: normalizeText(mediaItem.url) || '',
          altText: normalizeText(mediaItem.altText) || normalizeText(mediaItem.title) || '',
          title: normalizeText(mediaItem.title) || '',
          sourceType: normalizeText(mediaItem.sourceType) || '',
          type: normalizeText(mediaItem.type) || '',
          status: normalizeText(createResult.data?.status) || normalizeText(mediaItem.status) || 'active',
          signedUrl: normalizeText(mediaItem.url) || '',
          isVisible: createResult.data?.isVisible !== false,
          isFeatured: createResult.data?.isFeatured === true,
        };

        makeToast(this, 'Media item attached to product');
        await this.refreshMediaModalFromServer({
          focusMediaItemId: mediaItem.id,
        });
      } catch (error) {
        console.error(error);
        this.loadError = error?.message || 'Failed to attach media library item.';
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
      const safeName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]+/g, '-');
      const path = `public/media/products/${this.selectedProductId}/${Date.now()}-${safeName}`;

      const uploadTask = uploadData({
        path,
        data: file,
        options: {
          accessLevel: 'public',
          contentType: file.type || 'application/octet-stream',
        },
      });

      await uploadTask.result;

      return path;
    },
  },
};
