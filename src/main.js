import { createApp } from 'vue';
import { Amplify } from 'aws-amplify';

import App from './App.vue';
import router from './router';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './css/styles.css';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

const app = createApp(App);
app.use(router);
app.mount('#app');
