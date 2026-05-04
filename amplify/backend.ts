import { defineBackend } from '@aws-amplify/backend';
import { auth } from './Backend/auth/resource';
import { data } from './Backend/data/resource';
import { storage } from './Backend/storage/resource';
import { myFunction } from './Backend/function/myFunction/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  data,
  storage,
  myFunction,
});
