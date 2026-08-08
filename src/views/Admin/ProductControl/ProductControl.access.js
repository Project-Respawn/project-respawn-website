const PLATFORM_PRODUCT_GROUPS = new Set(['SuperAdmin', 'Admin', 'Staff']);

export function getProductControlCapabilities(accessContext, selectedBrandId) {
  const groups = Array.isArray(accessContext?.groups) ? accessContext.groups : [];
  const isPlatformOperator = groups.some((group) => PLATFORM_PRODUCT_GROUPS.has(group));
  const brands = Array.isArray(accessContext?.brands) ? accessContext.brands : [];
  const selectedBrand = brands.find((brand) => brand.brandId === selectedBrandId) || null;
  const canManageSelectedBrandProducts = selectedBrand?.permissionKeys?.includes('brand.products.manage') === true;

  return {
    isPlatformOperator,
    accessibleBrandIds: new Set(brands.map((brand) => brand.brandId).filter(Boolean)),
    selectedBrand,
    canEditScalarProduct: isPlatformOperator || Boolean(selectedBrandId && canManageSelectedBrandProducts),
    canManageRelationships: isPlatformOperator,
    canManageMedia: isPlatformOperator,
  };
}

export function filterProductsForProductControl(products, productBrandLinks, capabilities, selectedBrandId) {
  if (capabilities.isPlatformOperator) return products;
  if (!selectedBrandId || !capabilities.accessibleBrandIds.has(selectedBrandId)) return [];

  const visibleProductIds = new Set(
    productBrandLinks
      .filter((link) => link.brandId === selectedBrandId)
      .map((link) => link.productId)
  );
  return products.filter((product) => visibleProductIds.has(product.id));
}
