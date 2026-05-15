import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  resourceGroupName: 'auth',
  environment: {
    GROUP_NAME: 'Member',
  },
});