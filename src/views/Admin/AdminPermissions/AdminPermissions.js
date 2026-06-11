const ROLE_DEFINITIONS = {
  SuperAdmin: { label: 'Super Admin' },
  Admin: { label: 'Admin' },
  Staff: { label: 'Staff' },
  Moderator: { label: 'Moderator' },
  Trainer: { label: 'Trainer' },
  StreamingPartner: { label: 'Streaming Partner' },
  AffiliatePartner: { label: 'Affiliate Partner' },
  Member: { label: 'Member' },
  BetaMember: { label: 'Beta Member' },
};

const DEFAULT_SECTIONS = [
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
    items: [
      { key: 'bot.view_bot_section', label: 'View Bot Section' },
    ],
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
];

const DEFAULT_PERMISSIONS = {
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
};

function clonePermissionsMap(map) {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, [...value]])
  );
}

export default {
  name: 'AdminPermissions',

  data() {
    return {
      searchQuery: '',
      toastMessage: '',
      toastTimer: null,

      roles: [
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

      roleLabels: Object.fromEntries(
        Object.entries(ROLE_DEFINITIONS).map(([key, value]) => [key, value.label])
      ),

      permissionSections: DEFAULT_SECTIONS,
      permissions: clonePermissionsMap(DEFAULT_PERMISSIONS),
      originalPermissions: clonePermissionsMap(DEFAULT_PERMISSIONS),
    };
  },

  computed: {
    totalPermissionRows() {
      return this.permissionSections.reduce((sum, section) => sum + section.items.length, 0);
    },

    filteredSections() {
      const query = (this.searchQuery || '').trim().toLowerCase();

      if (!query) return this.permissionSections;

      return this.permissionSections
        .map((section) => {
          const matchesSection = section.label.toLowerCase().includes(query);

          if (matchesSection) return section;

          const items = section.items.filter((item) => {
            return (
              item.label.toLowerCase().includes(query) ||
              item.key.toLowerCase().includes(query)
            );
          });

          return {
            ...section,
            items,
          };
        })
        .filter((section) => section.items.length > 0 || section.label.toLowerCase().includes(query));
    },
  },

  methods: {
    togglePermission(permissionKey, role) {
      const current = this.permissions[permissionKey] || [];

      if (current.includes(role)) {
        this.permissions[permissionKey] = current.filter((item) => item !== role);
      } else {
        this.permissions[permissionKey] = [...current, role];
      }
    },

    resetPermissions() {
      this.permissions = clonePermissionsMap(this.originalPermissions);
      this.showToast('Permissions reset');
    },

    async savePermissions() {
      // Replace with your real API call later, e.g. /api/admin/permissions
      this.originalPermissions = clonePermissionsMap(this.permissions);
      this.showToast('Permissions saved');
    },

    showToast(message) {
      this.toastMessage = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastMessage = '';
      }, 3000);
    },
  },
};