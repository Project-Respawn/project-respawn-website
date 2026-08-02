import {
  ROLES,
  PERMISSION_SECTIONS,
  DEFAULT_PERMISSIONS,
  clonePermissionsMap,
  getRoleLabels,
} from '@/permissions/permissions';

export default {
  name: 'AdminPermissions',

  data() {
    return {
      searchQuery: '',
      toastMessage: '',
      toastTimer: null,

      roles: [...ROLES],
      roleLabels: getRoleLabels(),

      permissionSections: PERMISSION_SECTIONS,
      permissions: clonePermissionsMap(DEFAULT_PERMISSIONS),
      originalPermissions: clonePermissionsMap(DEFAULT_PERMISSIONS),
    };
  },

  computed: {
    totalPermissionRows() {
      return this.permissionSections.reduce(
        (sum, section) => sum + section.items.length,
        0
      );
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
        .filter(
          (section) =>
            section.items.length > 0 ||
            section.label.toLowerCase().includes(query)
        );
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