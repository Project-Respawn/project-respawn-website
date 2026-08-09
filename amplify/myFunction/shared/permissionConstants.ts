// Effective access comes from catalog assignments, including for platform
// groups. Keeping this list empty prevents group membership from silently
// overriding an explicit permission removal.
export const PLATFORM_CONTROL_PERMISSION_KEYS = [] as const
