import { defineBackend } from '@aws-amplify/backend';
import { auth } from './Backend/auth/resource';
import { data } from './Backend/data/resource';
import { storage } from './Backend/storage/resource';
import { myFunction } from './Backend/myFunction/resource';

defineBackend({
  auth,
  data,
  storage,
  myFunction,
});
