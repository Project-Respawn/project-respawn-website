import { defineFunction } from '@aws-amplify/backend';

export const adminUserManagement = defineFunction({
  name: 'admin-user-management',
  entry: './handler.ts',
  resourceGroupName: 'auth',
});