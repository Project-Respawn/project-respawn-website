import { generateClient } from 'aws-amplify/data';

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
      newBrand: {
        name: '',
        slug: '',
        description: '',
        status: 'active',
      },
    };
  },

  computed: {
    activeBrandCount() {
      return this.brands.filter((brand) => brand.status === 'active').length;
    },

    archivedBrandCount() {
      return this.brands.filter((brand) => brand.status === 'archived').length;
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
    await this.fetchBrands();
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

    async fetchBrands() {
      this.loading = true;
      this.loadError = '';

      try {
        const client = getClient();
        const { data, errors } = await client.models.Brand.list();

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to load brands.');
        }

        this.brands = [...(data || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      } catch (error) {
        this.loadError = error?.message || 'Failed to load brands.';
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
        const client = getClient();
        const { errors } = await client.models.Brand.create({
          name,
          slug: generatedSlug,
          description: this.newBrand.description.trim(),
          status: this.newBrand.status,
        });

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to create brand.');
        }

        this.resetForm();
        await this.fetchBrands();
        this.setToast('Brand created successfully.');
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
        status: 'active',
      };
    },

    async toggleBrandStatus(brand) {
      this.clearMessages();
      this.saving = true;

      try {
        const nextStatus = brand.status === 'active' ? 'archived' : 'active';

        const client = getClient();
        const { errors } = await client.models.Brand.update({
          id: brand.id,
          status: nextStatus,
        });

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to update brand.');
        }

        await this.fetchBrands();
        this.setToast(
          nextStatus === 'active'
            ? 'Brand restored successfully.'
            : 'Brand archived successfully.'
        );
      } catch (error) {
        this.loadError = error?.message || 'Failed to update brand.';
      } finally {
        this.saving = false;
      }
    },
  },

  beforeUnmount() {
    window.clearTimeout(this.toastTimeout);
  },
};