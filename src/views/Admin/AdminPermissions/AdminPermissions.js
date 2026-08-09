import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { refreshAccessContext } from '@/composables/useAccessContext.js';

const PLATFORM_ADMIN_GROUPS = ['SuperAdmin', 'Admin'];
let client;

function getClient() {
  return client ||= generateClient();
}

function clonePermissionMap(map) {
  return Object.fromEntries(
    Object.entries(map).map(([groupName, permissionKeys]) => [groupName, [...permissionKeys]])
  );
}

function groupLabel(groupName) {
  return String(groupName)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default {
  name: 'AdminPermissions',

  data() {
    return {
      searchQuery: '',
      toastMessage: '',
      toastTimer: null,
      accessChecking: true,
      hasPlatformAccess: false,
      loadingCatalog: false,
      catalogError: '',
      saving: false,
      roles: [],
      definitions: [],
      permissionsByGroup: {},
      originalPermissionsByGroup: {},
    };
  },

  computed: {
    totalPermissionRows() {
      return this.permissionSections.reduce((sum, section) => sum + section.items.length, 0);
    },

    permissionSections() {
      const sections = new Map();

      for (const definition of this.definitions.filter((item) => item.isActive)) {
        const key = definition.domain || 'Other';
        const section = sections.get(key) || { key, label: key, items: [] };
        section.items.push(definition);
        sections.set(key, section);
      }

      return [...sections.values()]
        .map((section) => ({
          ...section,
          items: [...section.items].sort(
            (left, right) =>
              left.module.localeCompare(right.module) ||
              left.sortOrder - right.sortOrder ||
              left.displayName.localeCompare(right.displayName)
          ),
        }))
        .sort((left, right) => left.label.localeCompare(right.label));
    },

    filteredSections() {
      const query = this.searchQuery.trim().toLowerCase();

      if (!query) return this.permissionSections;

      return this.permissionSections
        .map((section) => {
          const matchesSection = section.label.toLowerCase().includes(query);
          if (matchesSection) return section;

          return {
            ...section,
            items: section.items.filter((item) =>
              item.displayName.toLowerCase().includes(query) ||
              item.module.toLowerCase().includes(query) ||
              item.key.toLowerCase().includes(query)
            ),
          };
        })
        .filter((section) => section.items.length > 0 || section.label.toLowerCase().includes(query));
    },
  },

  async mounted() {
    await this.initialize();
  },

  methods: {
    async initialize() {
      this.accessChecking = true;

      try {
        const session = await fetchAuthSession();
        const groups =
          session.tokens?.accessToken?.payload?.['cognito:groups'] ||
          session.tokens?.idToken?.payload?.['cognito:groups'] ||
          [];

        this.hasPlatformAccess = Array.isArray(groups) && groups.some((group) =>
          PLATFORM_ADMIN_GROUPS.includes(group)
        );

        if (this.hasPlatformAccess) await this.loadCatalog();
      } catch {
        this.hasPlatformAccess = false;
      } finally {
        this.accessChecking = false;
      }
    },

    async loadCatalog() {
      this.loadingCatalog = true;
      this.catalogError = '';

      try {
        let result = await getClient().queries.listPermissionCatalog();
        const message = result.errors?.[0]?.message;
        if (message) throw new Error(message);
        if (!result.data) throw new Error('The permission catalog could not be loaded.');

        // Bootstrap is a separate protected mutation, so normal catalog reads stay read-only and fast.
        if (result.data.requiresBootstrap) {
          const seedResult = await getClient().mutations.seedPermissionCatalog();
          const seedMessage = seedResult.errors?.[0]?.message;
          if (seedMessage) throw new Error(seedMessage);
          if (!seedResult.data?.success) {
            throw new Error(seedResult.data?.message || 'The permission catalog bootstrap failed.');
          }

          result = await getClient().queries.listPermissionCatalog();
          const refreshedMessage = result.errors?.[0]?.message;
          if (refreshedMessage) throw new Error(refreshedMessage);
          if (!result.data) throw new Error('The permission catalog could not be loaded.');
        }

        this.definitions = Array.isArray(result.data.definitions) ? result.data.definitions : [];
        this.roles = [...new Set((result.data.assignments || []).map((item) => item.groupName))]
          .sort((left, right) => left.localeCompare(right));
        this.permissionsByGroup = this.createPermissionMap(result.data.assignments || []);
        this.originalPermissionsByGroup = clonePermissionMap(this.permissionsByGroup);
      } catch (error) {
        this.catalogError = error instanceof Error
          ? error.message
          : 'The permission catalog could not be loaded.';
      } finally {
        this.loadingCatalog = false;
      }
    },

    createPermissionMap(assignments) {
      const map = Object.fromEntries(this.roles.map((groupName) => [groupName, []]));

      for (const assignment of assignments) {
        if (assignment.enabled && map[assignment.groupName]) {
          map[assignment.groupName].push(assignment.permissionKey);
        }
      }

      return Object.fromEntries(
        Object.entries(map).map(([groupName, permissionKeys]) => [
          groupName,
          [...new Set(permissionKeys)].sort(),
        ])
      );
    },

    groupLabel,

    isPlatformAdminGroup(groupName) {
      return PLATFORM_ADMIN_GROUPS.includes(groupName);
    },

    isPlatformEnforced(definition) {
      return definition.platformEnforced === true;
    },

    isToggleDisabled(definition, groupName) {
      return this.isPlatformEnforced(definition) && this.isPlatformAdminGroup(groupName);
    },

    isPermissionAssigned(permissionKey, groupName, definition) {
      return this.isToggleDisabled(definition, groupName) ||
        (this.permissionsByGroup[groupName] || []).includes(permissionKey);
    },

    togglePermission(permissionKey, groupName, definition) {
      if (this.isToggleDisabled(definition, groupName)) return;
      const current = this.permissionsByGroup[groupName] || [];

      this.permissionsByGroup[groupName] = current.includes(permissionKey)
        ? current.filter((item) => item !== permissionKey)
        : [...current, permissionKey].sort();
    },

    resetPermissions() {
      this.permissionsByGroup = clonePermissionMap(this.originalPermissionsByGroup);
      this.showToast('Permissions reset');
    },

    async savePermissions() {
      const changedGroups = this.roles.filter((groupName) => {
        const current = this.permissionsByGroup[groupName] || [];
        const original = this.originalPermissionsByGroup[groupName] || [];
        return current.length !== original.length || current.some((key) => !original.includes(key));
      });

      if (changedGroups.length === 0) {
        this.showToast('No permission changes to save');
        return;
      }

      this.saving = true;
      this.catalogError = '';

      try {
        await Promise.all(changedGroups.map(async (groupName) => {
          const result = await getClient().mutations.replaceGroupPermissions({
            groupName,
            permissionKeys: this.permissionsByGroup[groupName] || [],
          });
          const message = result.errors?.[0]?.message;
          if (message) throw new Error(message);
        }));

        await this.loadCatalog();
        await refreshAccessContext();
        this.showToast('Permissions saved and access refreshed');
      } catch (error) {
        await this.loadCatalog();
        this.catalogError = error instanceof Error
          ? error.message
          : 'Permission changes could not be saved.';
      } finally {
        this.saving = false;
      }
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
