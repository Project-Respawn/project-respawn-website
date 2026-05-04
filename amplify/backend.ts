import { defineBackend } from '@aws-amplify/backend';
import { auth } from './backend/auth/resource';
import { data } from './backend/data/resource';
import { storage } from './backend/storage/resource';
import { myFunction } from './backend/function/myFunction/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  data,
  storage,
  myFunction,
});
