import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/admin-user-management'
import type { Schema } from '../../data/resource'

let clientPromise: Promise<ReturnType<typeof generateClient<Schema>>> | null = null

export async function getDataClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      // Amplify's generated declaration can temporarily omit this function's
      // data-client environment during an additive schema synthesis. Runtime
      // access is granted at schema scope in data/resource.ts.
      const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as unknown as Parameters<typeof getAmplifyDataClientConfig>[0])
      Amplify.configure(resourceConfig, libraryOptions)
      return generateClient<Schema>()
    })()
  }

  return clientPromise
}
