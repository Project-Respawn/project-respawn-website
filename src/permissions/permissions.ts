export const ROLE_DEFINITIONS = {
  SuperAdmin: { label: 'Super Admin' },
  Admin: { label: 'Admin' },
  Staff: { label: 'Staff' },
  Moderator: { label: 'Moderator' },
  Trainer: { label: 'Trainer' },
  StreamingPartner: { label: 'Streaming Partner' },
  AffiliatePartner: { label: 'Affiliate Partner' },
  Member: { label: 'Member' },
  BetaMember: { label: 'Beta Member' },
} as const;

export const ROLES = Object.keys(ROLE_DEFINITIONS);

export const PERMISSION_SECTIONS = [
  {
    key: 'admin-page',
    label: 'Admin Page',
    sectionClass: 'section-admin',
    items: [
      { key: 'admin.user_assignment', label: 'User assignment' },
      { key: 'admin.permissions_assignment', label: 'Permissions assignment' },
      { key: 'admin.user_history', label: 'User History' },
    ],
  },
  {
    key: 'forums',
    label: 'Forums',
    sectionClass: 'section-forums',
    items: [
      { key: 'forums.view_forums', label: 'View Forums' },
      { key: 'forums.add_section', label: 'Add Section' },
      { key: 'forums.delete_thread', label: 'Delete thread' },
      { key: 'forums.edit_thread', label: 'Edit thread' },
    ],
  },
  {
    key: 'bot-service',
    label: 'Bot Service',
    sectionClass: 'section-bot',
    items: [{ key: 'bot.view_bot_section', label: 'View Bot Section' }],
  },
  {
    key: 'profile-info',
    label: 'Profile Info',
    sectionClass: 'section-profile',
    items: [
      { key: 'profile.view_my_profile', label: 'View My Profile' },
      { key: 'profile.view_others_profile', label: 'View others profile' },
    ],
  },
] as const;

export const DEFAULT_PERMISSIONS = {
  'admin.user_assignment': ['SuperAdmin', 'Admin', 'Staff'],
  'admin.permissions_assignment': ['SuperAdmin', 'Admin'],
  'admin.user_history': ['SuperAdmin', 'Admin', 'Staff'],

  'forums.view_forums': [
    'SuperAdmin',
    'Admin',
    'Staff',
    'Moderator',
    'Trainer',
    'StreamingPartner',
    'AffiliatePartner',
    'Member',
    'BetaMember',
  ],
  'forums.add_section': ['SuperAdmin', 'Admin', 'Staff', 'Moderator'],
  'forums.delete_thread': ['SuperAdmin', 'Admin', 'Staff', 'Moderator'],
  'forums.edit_thread': ['SuperAdmin', 'Admin', 'Staff', 'Moderator'],

  'bot.view_bot_section': ['SuperAdmin', 'Admin', 'Staff', 'StreamingPartner'],

  'profile.view_my_profile': [
    'SuperAdmin',
    'Admin',
    'Staff',
    'Moderator',
    'Trainer',
    'StreamingPartner',
    'AffiliatePartner',
    'Member',
    'BetaMember',
  ],
  'profile.view_others_profile': [
    'SuperAdmin',
    'Admin',
    'Staff',
    'Moderator',
    'Trainer',
    'StreamingPartner',
    'AffiliatePartner',
    'BetaMember',
  ],
} as const;

export function clonePermissionsMap(map: Record<string, string[]>) {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, [...value]])
  );
}

export function canRole(
  role: string | undefined,
  permissionKey: string,
  permissionsMap: Record<string, string[]>
) {
  if (!role) return false;
  return Array.isArray(permissionsMap?.[permissionKey]) &&
    permissionsMap[permissionKey].includes(role);
}

export function canUser(
  user: { roles?: string[] } | null | undefined,
  permissionKey: string,
  permissionsMap: Record<string, string[]>
) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((role) => canRole(role, permissionKey, permissionsMap));
}

export function getRoleLabels() {
  return Object.fromEntries(
    Object.entries(ROLE_DEFINITIONS).map(([key, value]) => [key, value.label])
  );
}