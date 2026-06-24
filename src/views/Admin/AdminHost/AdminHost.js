import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

function getClient() {
  return generateClient();
}

function emptyHostForm() {
  return {
    hostTitle: '',
  };
}

function emptyAssignmentForm() {
  return {
    hostUserId: '',
    accessLevel: 'assign_only',
  };
}

export default {
  name: 'AdminHost',

  data() {
    return {
      loading: false,
      loadError: '',
      saving: false,
      formError: '',
      toastMessage: '',

      allUsers: [],
      hostProfiles: [],
      assignments: [],

      userSearch: '',
      selectedUser: null,
      selectedHostFilter: '',

      assignmentUserSearch: '',
      selectedManagerUser: null,

      currentAdmin: null,

      hostForm: emptyHostForm(),
      newAssignment: emptyAssignmentForm(),

      toastTimeout: null,
    };
  },

  computed: {
    filteredUsers() {
      const query = this.userSearch.trim().toLowerCase();
      const existingHostIds = new Set(
        this.hostProfiles.map((host) => host.ownerUserId || host.id),
      );

      const availableUsers = this.allUsers.filter(
        (user) => !existingHostIds.has(user.id),
      );

      if (!query) {
        return availableUsers.slice(0, 8);
      }

      return availableUsers
        .filter((user) => {
          const name = (user.name || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          return name.includes(query) || email.includes(query);
        })
        .slice(0, 12);
    },

    filteredManagerUsers() {
      const query = this.assignmentUserSearch.trim().toLowerCase();
      const selectedHostId = this.newAssignment.hostUserId || this.selectedHostFilter;

      const assignedManagerIds = new Set(
        this.assignments
          .filter((assignment) => assignment.hostUserId === selectedHostId)
          .map((assignment) => assignment.managerUserId),
      );

      const availableManagers = this.allUsers.filter((user) => {
        if (!user?.id) return false;
        if (user.id === selectedHostId) return false;
        if (assignedManagerIds.has(user.id)) return false;
        return true;
      });

      if (!query) {
        return availableManagers.slice(0, 8);
      }

      return availableManagers
        .filter((user) => {
          const name = (user.name || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          return name.includes(query) || email.includes(query);
        })
        .slice(0, 12);
    },

    filteredAssignments() {
      if (!this.selectedHostFilter) {
        return [];
      }

      return this.assignments
        .filter((assignment) => assignment.hostUserId === this.selectedHostFilter)
        .sort((a, b) => {
          const aName = (a.managerName || '').toLowerCase();
          const bName = (b.managerName || '').toLowerCase();
          return aName.localeCompare(bName);
        });
    },

    isEnableHostDisabled() {
      return this.saving || !this.selectedUser || !this.hostForm.hostTitle.trim();
    },

    isAssignmentDisabled() {
      return (
        this.saving ||
        !this.newAssignment.hostUserId ||
        !this.selectedManagerUser ||
        !this.newAssignment.accessLevel
      );
    },
  },

  async mounted() {
    await this.initializePage();
  },

  methods: {
    async initializePage() {
      this.loading = true;
      this.loadError = '';

      try {
        await Promise.all([
          this.fetchCurrentAdmin(),
          this.fetchUsers(),
          this.fetchHosts(),
          this.fetchAssignments(),
        ]);

        if (!this.selectedHostFilter && this.hostProfiles.length) {
          this.selectedHostFilter = this.hostProfiles[0].id;
        }

        if (!this.newAssignment.hostUserId && this.hostProfiles.length) {
          this.newAssignment.hostUserId = this.hostProfiles[0].id;
        }
      } catch (error) {
        this.loadError =
          error?.message || 'Failed to load host permissions data.';
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentAdmin() {
      try {
        const { username, userId } = await getCurrentUser();
        this.currentAdmin = {
          username: username || '',
          userId: userId || '',
        };
      } catch {
        this.currentAdmin = null;
      }
    },

    setToast(message) {
      this.toastMessage = message;
      window.clearTimeout(this.toastTimeout);
      this.toastTimeout = window.setTimeout(() => {
        this.toastMessage = '';
      }, 3000);
    },

    clearMessages() {
      this.formError = '';
      this.loadError = '';
      this.toastMessage = '';
    },

    async fetchUsers() {
      const client = getClient();

      const { data, errors } = await client.queries.listAdminUsers({
        authMode: 'userPool',
      });

      if (errors?.length) {
        throw new Error(errors[0].message || 'Failed to load users.');
      }

      const adminUsers = data || [];

      const userIds = adminUsers
        .map((user) => user.id || user.userId || user.sub || user.username)
        .filter(Boolean);

      let profiles = [];

      if (userIds.length) {
        const profileResponse = await client.models.UserProfile.list({
          filter: {
            or: userIds.map((id) => ({
              ownerUserId: { eq: id },
            })),
          },
          authMode: 'userPool',
        });

        if (profileResponse.errors?.length) {
          throw new Error(
            profileResponse.errors[0].message || 'Failed to load user profiles.',
          );
        }

        profiles = profileResponse.data || [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.ownerUserId, profile]),
      );

      this.allUsers = adminUsers.map((user) => {
        const internalId = user.id || user.userId || user.sub || user.username;
        const profile = profileMap.get(internalId);

        return {
          id: internalId,
          username: user.username || '',
          email: user.email || '',
          name:
            profile?.displayName ||
            user.displayName ||
            user.name ||
            user.email ||
            'Unnamed user',
          profileId: profile?.id || null,
          profile: profile || null,
        };
      });
    },

    async fetchHosts() {
      const client = getClient();

      const { data, errors } = await client.models.UserProfile.list({
        authMode: 'userPool',
      });

      if (errors?.length) {
        throw new Error(errors[0].message || 'Failed to load host profiles.');
      }

      this.hostProfiles = (data || [])
        .filter((profile) => profile.canHostEvents === true)
        .map((profile) => ({
          id: profile.ownerUserId || profile.id,
          profileId: profile.id,
          ownerUserId: profile.ownerUserId || profile.id,
          displayName: profile.displayName || 'Unnamed host',
          email: profile.email || '',
          hostTitle: profile.hostTitle || 'Host',
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
    },

    async fetchAssignments() {
      const client = getClient();

      if (!client.models.HostAssignment) {
        this.assignments = [];
        return;
      }

      const { data, errors } = await client.models.HostAssignment.list({
        authMode: 'userPool',
      });

      if (errors?.length) {
        throw new Error(errors[0].message || 'Failed to load host assignments.');
      }

      this.assignments = (data || []).map((assignment) => ({
        id: assignment.id,
        hostUserId: assignment.hostUserId,
        managerUserId: assignment.managerUserId,
        managerUsername: assignment.managerUsername || '',
        managerEmail: assignment.managerEmail || '',
        managerName:
          assignment.managerDisplayName ||
          assignment.managerUsername ||
          assignment.managerEmail ||
          'Unknown manager',
        hostDisplayName: assignment.hostDisplayName || '',
        accessLevel: assignment.accessLevel || 'assign_only',
      }));
    },

    selectUser(user) {
      this.selectedUser = user;
      this.formError = '';
      this.hostForm.hostTitle = user?.name ? `${user.name} Host` : '';
    },

    selectManagerUser(user) {
      this.selectedManagerUser = user;
      this.formError = '';
    },

    getHostName(hostUserId) {
      const match = this.hostProfiles.find((host) => host.id === hostUserId);
      return match ? match.displayName : 'Unknown host';
    },

    resetHostForm() {
      this.formError = '';
      this.selectedUser = null;
      this.userSearch = '';
      this.hostForm = emptyHostForm();
    },

    resetAssignmentForm() {
      this.formError = '';
      this.assignmentUserSearch = '';
      this.selectedManagerUser = null;
      this.newAssignment = {
        hostUserId: this.hostProfiles[0]?.id || '',
        accessLevel: 'assign_only',
      };
    },

    async enableSelectedUserAsHost() {
      this.clearMessages();

      if (!this.selectedUser) {
        this.formError = 'Select a user first.';
        return;
      }

      if (!this.hostForm.hostTitle.trim()) {
        this.formError = 'Enter a host title.';
        return;
      }

      const profileId = this.selectedUser.profileId;

      if (!profileId) {
        this.formError = 'That user does not have a UserProfile record yet.';
        return;
      }

      this.saving = true;

      try {
        const client = getClient();

        const { errors } = await client.models.UserProfile.update(
          {
            id: profileId,
            canHostEvents: true,
            hostTitle: this.hostForm.hostTitle.trim(),
          },
          {
            authMode: 'userPool',
          },
        );

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to enable host access.');
        }

        await this.fetchUsers();
        await this.fetchHosts();

        const newHost = this.hostProfiles.find(
          (host) => host.ownerUserId === this.selectedUser.id,
        );

        if (newHost) {
          this.selectedHostFilter = newHost.id;
          this.newAssignment.hostUserId = newHost.id;
        }

        this.setToast('Host access enabled successfully.');
        this.resetHostForm();
      } catch (error) {
        this.formError = error?.message || 'Failed to enable host access.';
      } finally {
        this.saving = false;
      }
    },

    async assignManagerToHost() {
      this.clearMessages();

      if (!this.newAssignment.hostUserId) {
        this.formError = 'Select a host.';
        return;
      }

      if (!this.selectedManagerUser) {
        this.formError = 'Select a manager user.';
        return;
      }

      const duplicate = this.assignments.some(
        (assignment) =>
          assignment.hostUserId === this.newAssignment.hostUserId &&
          assignment.managerUserId === this.selectedManagerUser.id,
      );

      if (duplicate) {
        this.formError = 'That user is already assigned to this host.';
        return;
      }

      this.saving = true;

      try {
        const client = getClient();
        const selectedHost = this.hostProfiles.find(
          (host) => host.id === this.newAssignment.hostUserId,
        );

        if (!selectedHost) {
          throw new Error('Selected host could not be found.');
        }

        const { errors } = await client.models.HostAssignment.create(
          {
            hostUserId: this.newAssignment.hostUserId,
            managerUserId: this.selectedManagerUser.id,
            managerUsername: this.selectedManagerUser.username || '',
            managerEmail: this.selectedManagerUser.email || '',
            managerDisplayName: this.selectedManagerUser.name || '',
            hostDisplayName: selectedHost.displayName || '',
            accessLevel: this.newAssignment.accessLevel,
            assignedBy:
              this.currentAdmin?.username ||
              this.currentAdmin?.userId ||
              'unknown-admin',
          },
          {
            authMode: 'userPool',
          },
        );

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to assign host manager.');
        }

        await this.fetchAssignments();
        this.selectedHostFilter = this.newAssignment.hostUserId;
        this.setToast('Host manager assigned successfully.');
        this.resetAssignmentForm();
      } catch (error) {
        this.formError = error?.message || 'Failed to assign host manager.';
      } finally {
        this.saving = false;
      }
    },

    async removeAssignment(assignment) {
      this.clearMessages();
      this.saving = true;

      try {
        const client = getClient();

        if (!client.models.HostAssignment) {
          throw new Error(
            'HostAssignment model is missing from the Amplify schema.',
          );
        }

        const { errors } = await client.models.HostAssignment.delete(
          { id: assignment.id },
          { authMode: 'userPool' },
        );

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to remove assignment.');
        }

        await this.fetchAssignments();
        this.setToast('Host access removed successfully.');
      } catch (error) {
        this.loadError = error?.message || 'Failed to remove assignment.';
      } finally {
        this.saving = false;
      }
    },
  },

  beforeUnmount() {
    window.clearTimeout(this.toastTimeout);
  },
};