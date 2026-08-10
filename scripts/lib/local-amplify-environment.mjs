export const EXPECTED_SANDBOX_IDENTIFIER = 'Ntgrestage8'

export function deploymentPrefix(stackName, resourceName) {
  const marker = `-${EXPECTED_SANDBOX_IDENTIFIER}-sandbox-`
  if (!stackName.includes(marker)) throw new Error(`${resourceName} does not belong to sandbox ${EXPECTED_SANDBOX_IDENTIFIER}.`)
  const suffixIndex = stackName.search(/-(?:auth|data|storage|apistack)[A-Za-z0-9]+-/)
  if (suffixIndex < 0) throw new Error(`${resourceName} has an unrecognised Amplify stack name.`)
  return stackName.slice(0, suffixIndex)
}

export function validateEnvironmentDescriptor({ outputs, poolTags, apiTags, poolStackName, apiStackName }) {
  if (poolTags?.['amplify:deployment-type'] !== 'sandbox') throw new Error('Cognito is not an Amplify sandbox resource.')
  if (apiTags?.['amplify:deployment-type'] !== 'sandbox') throw new Error('AppSync is not an Amplify sandbox resource.')
  const poolPrefix = deploymentPrefix(poolStackName, 'Cognito')
  const apiPrefix = deploymentPrefix(apiStackName, 'AppSync')
  if (poolPrefix !== apiPrefix) throw new Error('Cognito and AppSync belong to different sandbox deployments.')
  if (!outputs?.auth?.user_pool_id || !outputs?.data?.url) throw new Error('Amplify outputs are incomplete.')
  return poolPrefix
}
