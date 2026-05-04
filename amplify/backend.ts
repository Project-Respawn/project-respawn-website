import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFunction } from './myFunction/resource';

defineBackend({
  auth,
  data,
  storage,
  myFunction,
});
