import { generateClient } from 'aws-amplify/data';
import { refreshAccessContext } from '@/composables/useAccessContext.js';
import { assertCreatedBrandVisible, listAllBrands, normalizeOwnerUsers, requireSuccessfulBrandMutation } from './AdminBrands.results.js';

function getClient() {
  return generateClient({
    authMode: 'userPool',
  });
}

function slugify(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default {
  name: 'AdminBrands',

  data() {
    return {
      brands: [],
      loading: false,
      loadError: '',
      saving: false,
      formError: '',
      toastMessage: '',
      toastTimeout: null,
      ownerInputs: {},
      ownerUsers: [],
      loadingOwnerUsers: false,
      ownerUsersError: '',
      newBrand: {
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      },
    };
  },

  computed: {
    activeBrandCount() {
      return this.brands.filter((brand) => brand.isActive).length;
    },

    archivedBrandCount() {
      return this.brands.filter((brand) => !brand.isActive).length;
    },
  },

  watch: {
    'newBrand.name'(value) {
      if (!this.newBrand.slug.trim()) {
        this.newBrand.slug = slugify(value);
      }
    },
  },

  async mounted() {
    await Promise.all([this.fetchBrands(), this.fetchOwnerUsers()]);
  },

  methods: {
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

    async fetchBrands({ throwOnError = false } = {}) {
      this.loading = true;
      this.loadError = '';

      try {
        this.brands = (await listAllBrands(getClient())).sort((a, b) => {
          const orderDifference = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          return orderDifference || a.name.localeCompare(b.name);
        });
        this.ownerInputs = Object.fromEntries(this.brands.map((brand) => [brand.id, brand.ownerUserId || '']));
      } catch (error) {
        this.loadError = error?.message || 'Failed to load brands.';
        if (throwOnError) throw error;
      } finally {
        this.loading = false;
      }
    },

    async addBrand() {
      const name = this.newBrand.name.trim();
      const generatedSlug = this.newBrand.slug.trim()
        ? slugify(this.newBrand.slug)
        : slugify(name);

      this.clearMessages();

      if (!name) {
        this.formError = 'Brand name is required.';
        return;
      }

      if (!generatedSlug) {
        this.formError = 'A valid slug is required.';
        return;
      }

      const slugExists = this.brands.some(
        (brand) => brand.slug.toLowerCase() === generatedSlug.toLowerCase()
      );

      if (slugExists) {
        this.formError = 'A brand with this slug already exists.';
        return;
      }

      this.saving = true;

      try {
        const result = await getClient().mutations.createManagedBrand({
          name,
          slug: generatedSlug,
          description: this.newBrand.description.trim(),
          sortOrder: Number(this.newBrand.sortOrder) || 0,
          isActive: this.newBrand.isActive === true,
        });

        const created = requireSuccessfulBrandMutation(result, 'Failed to create brand.');

        this.resetForm();
        await this.fetchBrands({ throwOnError: true });
        assertCreatedBrandVisible(this.brands, created.brandId);
        await refreshAccessContext({ force: true });
        this.setToast(created.message || 'Brand created successfully.');
      } catch (error) {
        this.formError = error?.message || 'Failed to create brand.';
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.formError = '';
      this.newBrand = {
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      };
    },

    async toggleBrandStatus(brand) {
      this.clearMessages();
      this.saving = true;

      try {
        const nextIsActive = !brand.isActive;

        const result = await getClient().mutations.updateManagedBrand({
          brandId: brand.id,
          isActive: nextIsActive,
        });

        requireSuccessfulBrandMutation(result, 'Failed to update brand.');

        await this.fetchBrands();
        this.setToast(
          nextIsActive
            ? 'Brand restored successfully.'
            : 'Brand archived successfully.'
        );
      } catch (error) {
        this.loadError = error?.message || 'Failed to update brand.';
      } finally {
        this.saving = false;
      }
    },

    async fetchOwnerUsers() {
      this.loadingOwnerUsers = true;
      this.ownerUsersError = '';
      try {
        const result = await getClient().queries.listAdminUsers();
        if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load eligible Brand Owners.');
        this.ownerUsers = normalizeOwnerUsers(result.data);
      } catch (error) {
        this.ownerUsers = [];
        this.ownerUsersError = error?.message || 'Failed to load eligible Brand Owners.';
      } finally {
        this.loadingOwnerUsers = false;
      }
    },

    async saveBrandOwner(brand) {
      const ownerUserId = (this.ownerInputs[brand.id] || '').trim();
      if (!ownerUserId) {
        this.loadError = 'A Brand Owner Cognito user ID is required.';
        return;
      }

      this.clearMessages();
      this.saving = true;
      try {
        const result = await getClient().mutations.setBrandOwner({ brandId: brand.id, ownerUserId });
        const updated = requireSuccessfulBrandMutation(result, 'Failed to update Brand Owner.');
        await this.fetchBrands({ throwOnError: true });
        await refreshAccessContext({ force: true });
        this.setToast(updated.message || 'Brand Owner updated.');
      } catch (error) {
        this.loadError = error?.message || 'Failed to update Brand Owner.';
      } finally {
        this.saving = false;
      }
    },
  },

  beforeUnmount() {
    window.clearTimeout(this.toastTimeout);
  },
};
