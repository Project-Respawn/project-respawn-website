const PLATFORM_EVENT_GROUPS = new Set(['SuperAdmin', 'Admin', 'Staff']);

export function getAdminEventsCapabilities(accessContext, selectedBrandId) {
  const groups = Array.isArray(accessContext?.groups) ? accessContext.groups : [];
  const isPlatformOperator = groups.some((group) => PLATFORM_EVENT_GROUPS.has(group));
  const brands = Array.isArray(accessContext?.brands) ? accessContext.brands : [];
  const selectedBrand = brands.find((brand) => brand.brandId === selectedBrandId) || null;

  return {
    isPlatformOperator,
    accessibleBrandIds: new Set(brands.map((brand) => brand.brandId).filter(Boolean)),
    selectedBrand,
    canManageSelectedBrandEvents: isPlatformOperator || selectedBrand?.permissionKeys?.includes('brand.events.manage') === true,
  };
}

export function filterEventsForAdminEvents(events, capabilities, selectedBrandId) {
  if (capabilities.isPlatformOperator) return events;
  if (!selectedBrandId || !capabilities.accessibleBrandIds.has(selectedBrandId)) return [];
  return events.filter((event) => event.brandId === selectedBrandId);
}
