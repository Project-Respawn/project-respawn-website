import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/myFunction-rebuild'
import type { Schema } from '../../data/resource'

let clientPromise: Promise<ReturnType<typeof generateClient<Schema>>> | null = null

export async function getDataClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
      Amplify.configure(resourceConfig, libraryOptions)
      return generateClient<Schema>()
    })()
  }
  return clientPromise
}
