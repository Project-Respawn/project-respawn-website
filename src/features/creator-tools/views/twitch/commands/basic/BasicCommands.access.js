const PLATFORM_TWITCH_GROUPS = new Set(['SuperAdmin', 'Admin', 'Staff']);

export function getTwitchCommandCapabilities(accessContext, selectedBrandId) {
  const groups = Array.isArray(accessContext?.groups) ? accessContext.groups : [];
  const isPlatformOperator = groups.some((group) => PLATFORM_TWITCH_GROUPS.has(group));
  const brands = Array.isArray(accessContext?.brands) ? accessContext.brands : [];
  const selectedBrand = brands.find((brand) => brand.brandId === selectedBrandId) || null;
  return {
    isPlatformOperator,
    accessibleBrandIds: new Set(brands.map((brand) => brand.brandId).filter(Boolean)),
    selectedBrand,
    canManageSelectedBrandCommands: isPlatformOperator || selectedBrand?.permissionKeys?.includes('brand.twitch.manage') === true,
  };
}

export function filterTwitchCommandsForBrand(commands, capabilities, selectedBrandId) {
  if (!capabilities.isPlatformOperator && !capabilities.accessibleBrandIds.has(selectedBrandId)) return [];
  const scoped = commands.filter((command) => command.brandId === selectedBrandId);
  if (!capabilities.isPlatformOperator) return scoped;
  return [...scoped, ...commands.filter((command) => !command.brandId).map((command) => ({ ...command, isUnscoped: true }))];
}
