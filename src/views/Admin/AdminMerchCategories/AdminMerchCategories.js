import { generateClient } from 'aws-amplify/data';

let client;
function getClient() {
  if (!client) {
    client = generateClient();
  }
  return client;
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

function sortByOrder(items = []) {
  return [...items].sort((a, b) => {
    const aOrder = Number.isFinite(a.sortOrder) ? a.sortOrder : 0;
    const bOrder = Number.isFinite(b.sortOrder) ? b.sortOrder : 0;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return (a.name || '').localeCompare(b.name || '');
  });
}

async function listAllCategories() {
  const categories = [];
  let nextToken;

  do {
    const { data, errors, nextToken: receivedNextToken } = await getClient().models.MerchCategory.list({
      authMode: 'userPool',
      limit: 1000,
      nextToken,
    });

    if (errors?.length) {
      throw new Error(errors[0].message || 'Failed to load categories.');
    }

    categories.push(...(data || []));
    nextToken = receivedNextToken;
  } while (nextToken);

  return categories;
}

export default {
  name: 'AdminMerchCategories',

  data() {
    return {
      loading: false,
      loadError: '',
      saving: false,
      formError: '',
      toastMessage: '',
      categories: [],
      newCategory: {
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      },
      toastTimeout: null,
    };
  },

  computed: {
    filteredCategories() {
      return sortByOrder(this.categories);
    },

    activeCategoryCount() {
      return this.filteredCategories.filter((category) => category.isActive).length;
    },

    archivedCategoryCount() {
      return this.filteredCategories.filter((category) => !category.isActive).length;
    },

    isSubmitDisabled() {
      return this.saving || !this.newCategory.name.trim();
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
        await this.fetchCategories();
      } catch (error) {
        this.loadError =
          error?.message || 'Failed to load merch categories.';
      } finally {
        this.loading = false;
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

    async fetchCategories() {
      this.categories = sortByOrder(
        (await listAllCategories()).map((category) => ({
          id: category.id,
          name: category.name || '',
          slug: category.slug || '',
          description: category.description || '',
          sortOrder:
            typeof category.sortOrder === 'number' ? category.sortOrder : 0,
          isActive: !!category.isActive,
        }))
      );
    },

    async addCategory() {
      this.clearMessages();

      const name = this.newCategory.name.trim();
      const generatedSlug = this.newCategory.slug.trim()
        ? slugify(this.newCategory.slug)
        : slugify(name);

      if (!name) {
        this.formError = 'Category name is required.';
        return;
      }

      if (!generatedSlug) {
        this.formError = 'Slug is required.';
        return;
      }

      const duplicateSlug = this.categories.some(
        (category) => category.slug === generatedSlug
      );

      if (duplicateSlug) {
        this.formError = 'A category with that slug already exists.';
        return;
      }

      this.saving = true;

      try {
        const { errors } = await getClient().mutations.manageMerchCategory({ action: 'create', input: JSON.stringify({
            name,
            slug: generatedSlug,
            description: this.newCategory.description.trim(),
            sortOrder: Number(this.newCategory.sortOrder) || 0,
            isActive: !!this.newCategory.isActive,
          }) });

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to create category.');
        }

        await this.fetchCategories();
        this.setToast('Category created successfully.');
        this.resetForm();
      } catch (error) {
        this.formError = error?.message || 'Failed to create category.';
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.formError = '';
      this.newCategory = {
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      };
    },

    async toggleCategoryStatus(category) {
      this.clearMessages();
      this.saving = true;

      try {
        const nextIsActive = !category.isActive;

        const { errors } = await getClient().mutations.manageMerchCategory(
          { action: 'update', resourceId: category.id, input: JSON.stringify({
            isActive: nextIsActive,
          }) }
        );

        if (errors?.length) {
          throw new Error(errors[0].message || 'Failed to update category.');
        }

        await this.fetchCategories();
        this.setToast(
          nextIsActive
            ? 'Category restored successfully.'
            : 'Category archived successfully.'
        );
      } catch (error) {
        this.loadError = error?.message || 'Failed to update category.';
      } finally {
        this.saving = false;
      }
    },
  },

  beforeUnmount() {
    window.clearTimeout(this.toastTimeout);
  },
};
