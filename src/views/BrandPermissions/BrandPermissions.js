import { generateClient } from 'aws-amplify/data';
import { refreshAccessContext, useAccessContext } from '@/composables/useAccessContext.js';

let client;
function getClient() {
  return client ||= generateClient();
}

export default {
  name: 'BrandPermissions',

  data() {
    return {
      brands: [],
      selectedBrandId: '',
      details: null,
      loading: true,
      saving: false,
      error: '',
      message: '',
      currentGroups: [],
      helperForm: { userId: '', displayName: '', email: '', permissionKeys: [] },
      ownerUserId: '',
    };
  },

  computed: {
    selectedBrand() {
      return this.brands.find((brand) => brand.brandId === this.selectedBrandId) || null;
    },

    isPlatformOperator() {
      return this.currentGroups.some((group) => ['SuperAdmin', 'Admin', 'Staff'].includes(group));
    },
  },

  async mounted() {
    await this.refreshBrands();
  },

  methods: {
    async refreshBrands() {
      this.loading = true;
      this.error = '';
      try {
        const context = await refreshAccessContext({ force: true });
        this.currentGroups = context.groups || [];
        this.brands = context.brands || [];
        this.selectedBrandId = this.brands.some((brand) => brand.brandId === this.selectedBrandId)
          ? this.selectedBrandId
          : this.brands[0]?.brandId || '';
        if (this.selectedBrandId) await this.loadDetails();
      } catch (error) {
        this.error = error?.message || 'Unable to load accessible brands.';
      } finally {
        this.loading = false;
      }
    },

    async loadDetails() {
      if (!this.selectedBrandId) return;
      this.loading = true;
      this.error = '';
      try {
        const result = await getClient().queries.getBrandPermissionDetails({ brandId: this.selectedBrandId });
        if (result.errors?.length) throw new Error(result.errors[0].message);
        this.details = result.data;
        this.ownerUserId = result.data?.brand?.ownerUserId || '';
      } catch (error) {
        this.details = null;
        this.error = error?.message || 'Unable to load brand permissions.';
      } finally {
        this.loading = false;
      }
    },

    async selectBrand() {
      this.resetHelperForm();
      await this.loadDetails();
    },

    togglePermission(permissionKey) {
      const keys = this.helperForm.permissionKeys;
      this.helperForm.permissionKeys = keys.includes(permissionKey)
        ? keys.filter((key) => key !== permissionKey)
        : [...keys, permissionKey];
    },

    editHelper(helper) {
      this.helperForm = {
        userId: helper.userId,
        displayName: helper.displayName || '',
        email: helper.email || '',
        permissionKeys: [...helper.permissionKeys],
      };
      this.message = '';
    },

    resetHelperForm() {
      this.helperForm = { userId: '', displayName: '', email: '', permissionKeys: [] };
    },

    async saveHelper() {
      if (!this.helperForm.userId.trim()) {
        this.error = 'A helper Cognito user ID is required.';
        return;
      }
      this.saving = true;
      this.error = '';
      try {
        const result = await getClient().mutations.upsertBrandHelper({
          brandId: this.selectedBrandId,
          userId: this.helperForm.userId.trim(),
          displayName: this.helperForm.displayName.trim() || undefined,
          email: this.helperForm.email.trim() || undefined,
          permissionKeys: this.helperForm.permissionKeys,
        });
        if (result.errors?.length) throw new Error(result.errors[0].message);
        await this.loadDetails();
        await refreshAccessContext();
        this.resetHelperForm();
        this.message = 'Brand helper saved.';
      } catch (error) {
        this.error = error?.message || 'Unable to save brand helper.';
      } finally {
        this.saving = false;
      }
    },

    async removeHelper(userId) {
      this.saving = true;
      this.error = '';
      try {
        const result = await getClient().mutations.removeBrandHelper({ brandId: this.selectedBrandId, userId });
        if (result.errors?.length) throw new Error(result.errors[0].message);
        await this.loadDetails();
        await refreshAccessContext();
        this.message = 'Brand helper removed.';
      } catch (error) {
        this.error = error?.message || 'Unable to remove brand helper.';
      } finally {
        this.saving = false;
      }
    },

    async saveOwner() {
      if (!this.ownerUserId.trim()) {
        this.error = 'A Brand Owner Cognito user ID is required.';
        return;
      }
      this.saving = true;
      this.error = '';
      try {
        const result = await getClient().mutations.setBrandOwner({
          brandId: this.selectedBrandId,
          ownerUserId: this.ownerUserId.trim(),
        });
        if (result.errors?.length) throw new Error(result.errors[0].message);
        await this.refreshBrands();
        this.message = 'Brand Owner updated.';
      } catch (error) {
        this.error = error?.message || 'Unable to update Brand Owner.';
      } finally {
        this.saving = false;
      }
    },
  },
};
