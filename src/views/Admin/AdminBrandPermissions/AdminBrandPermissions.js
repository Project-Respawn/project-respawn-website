import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

function getClient() {
  return generateClient();
}

export default {
  name: 'AdminBrandPermissions',

  data() {
    return {
      loading: false,
      loadError: '',
      saving: false,
      formError: '',
      toastMessage: '',
      allUsers: [],
      brands: [],
      assignments: [],
      userSearch: '',
      selectedUser: null,
      selectedBrandFilter: '',
      currentAdmin: null,
      newAssignment: {
        brandId: '',
        accessLevel: 'assign',
      },
      toastTimeout: null,
    };
  },

  computed: {
    filteredUsers() {
      const query = this.userSearch.trim().toLowerCase();

      if (!query) {
        return this.allUsers.slice(0, 8);
      }

      return this.allUsers
        .filter((user) => {
          const name = (user.name || '').toLowerCase();
          const email = (user.email || '').toLowerCase();

          return name.includes(query) || email.includes(query);
        })
        .slice(0, 12);
    },

    filteredAssignments() {
      if (!this.selectedBrandFilter) {
        return [];
      }

      return this.assignments
        .filter((assignment) => assignment.brandId === this.selectedBrandFilter)
        .sort((a, b) => {
          const aName = (a.userName || '').toLowerCase();
          const bName = (b.userName || '').toLowerCase();
          return aName.localeCompare(bName);
        });
    },

    isSubmitDisabled() {
      return (
        this.saving ||
        !this.selectedUser ||
        !this.newAssignment.brandId ||
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
          this.fetchBrands(),
          this.fetchAssignments(),
          this.fetchUsers(),
        ]);

        if (!this.selectedBrandFilter && this.brands.length) {
          this.selectedBrandFilter = this.brands[0].id;
        }

        if (!this.newAssignment.brandId && this.brands.length) {
          this.newAssignment.brandId = this.brands[0].id;
        }
      } catch (error) {
        this.loadError =
          error?.message || 'Failed to load brand permissions data.';
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

    async fetchBrands() {
      const { data, errors } = await getClient().models.Brand.list({
        authMode: 'userPool',
      });

      if (errors?.length) {
        throw new Error(errors[0].message || 'Failed to load brands.');
      }

      this.brands = [...(data || [])]
        .filter((brand) => brand.status === 'active')
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async fetchAssignments() {
      const client = getClient();

      if (!client.models.BrandAssignment) {
        this.assignments = [];
        return;
      }

      const { data, errors } = await client.models.BrandAssignment.list({
        authMode: 'userPool',
      });

      if (errors?.length) {
        throw new Error(errors[0].message || 'Failed to load brand assignments.');
      }

      this.assignments = (data || []).map((assignment) => ({
        id: assignment.id,
        brandId: assignment.brandId,
        userId: assignment.userId,
        username: assignment.username || '',
        email: assignment.email || '',
        userName:
          assignment.displayName ||
          assignment.name ||
          assignment.email ||
          'Unknown user',
        accessLevel: assignment.accessLevel || 'assign',
      }));
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
            profileResponse.errors[0].message || 'Failed to load user profiles.'
          );
        }

        profiles = profileResponse.data || [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.ownerUserId, profile])
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
        };
      });
    },

    selectUser(user) {
      this.selectedUser = user;
      this.formError = '';
    },

    getBrandName(brandId) {
      const match = this.brands.find((brand) => brand.id === brandId);
      return match ? match.name : 'Unknown brand';
    },

    resetAssignmentForm() {
      this.formError = '';
      this.selectedUser = null;
      this.userSearch = '';
      this.newAssignment = {
        brandId: this.brands[0]?.id || '',
        accessLevel: 'assign',
      };
    },

    async assignUserToBrand() {
      this.clearMessages();

      if (!this.selectedUser) {
        this.formError = 'Select a user first.';
        return;
      }

      if (!this.newAssignment.brandId) {
        this.formError = 'Select a brand.';
        return;
      }

      const duplicate = this.assignments.some(
        (assignment) =>
          assignment.brandId === this.newAssignment.brandId &&
          assignment.userId === this.selectedUser.id
      );

      if (duplicate) {
        this.formError = 'That user already has access to this brand.';
        return;
      }

      this.saving = true;

      try {
        const client = getClient();

        if (!client.models.BrandAssignment) {
          throw new Error(
            'BrandAssignment model is missing from the Amplify schema.'
          );
        }

        const { errors } = await client.models.BrandAssignment.create(
          {
            brandId: this.newAssignment.brandId,
            userId: this.selectedUser.id,
            username: this.selectedUser.username || '',
            email: this.selectedUser.email || '',
            displayName: this.selectedUser.name,
            accessLevel: this.newAssignment.accessLevel,
            assignedBy:
              this.currentAdmin?.username ||
              this.currentAdmin?.userId ||
              'unknown-admin',
          },
          {
            authMode: 'userPool',
          }
        );

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to assign brand access.');
        }

        await this.fetchAssignments();
        this.selectedBrandFilter = this.newAssignment.brandId;
        this.setToast('Brand access assigned successfully.');
        this.resetAssignmentForm();
      } catch (error) {
        this.formError = error?.message || 'Failed to assign brand access.';
      } finally {
        this.saving = false;
      }
    },

    async removeAssignment(assignment) {
      this.clearMessages();
      this.saving = true;

      try {
        const client = getClient();

        if (!client.models.BrandAssignment) {
          throw new Error(
            'BrandAssignment model is missing from the Amplify schema.'
          );
        }

        const { errors } = await client.models.BrandAssignment.delete(
          { id: assignment.id },
          { authMode: 'userPool' }
        );

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to remove assignment.');
        }

        await this.fetchAssignments();
        this.setToast('Brand access removed successfully.');
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