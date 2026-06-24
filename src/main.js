import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './css/styles.css';

try {
  Amplify.configure({
    ...outputs,
    Auth: {
      ...(outputs.Auth ?? {}),
      Cognito: {
        ...(outputs.Auth?.Cognito ?? {}),
        allowGuestAccess: true,
      },
    },
  });

  const app = createApp(App);
  app.use(router);
  app.mount('#app');

  bootstrap();
} catch (error) {
  console.error('Failed to configure Amplify:', error);
}