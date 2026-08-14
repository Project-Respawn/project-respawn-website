import { createHash } from 'node:crypto'

export const EXPECTED_SANDBOX_IDENTIFIER = 'Ntgrestage8'
export const EXPECTED_SANDBOX_NAMESPACE = 'project-respawn-website'
export const EXPECTED_SANDBOX_ROOT = 'amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e'

export function resolveSandboxRoot(namespace = EXPECTED_SANDBOX_NAMESPACE, identifier = EXPECTED_SANDBOX_IDENTIFIER) {
  if (identifier !== EXPECTED_SANDBOX_IDENTIFIER) throw new Error(`Protected sandbox identifier must be ${EXPECTED_SANDBOX_IDENTIFIER}.`)
  const sanitize = (value) => value.replace(/[^A-Za-z0-9]/g, '')
  const hash = createHash('sha512').update(namespace).update(identifier).digest('hex').slice(0, 10)
  return `amplify-${sanitize(namespace)}-${sanitize(identifier)}-sandbox-${hash}`
}

export function assertProtectedSandboxRoot(root) {
  const derived = resolveSandboxRoot()
  if (derived !== EXPECTED_SANDBOX_ROOT) throw new Error(`Installed protected sandbox derivation changed: ${derived}.`)
  if (root !== EXPECTED_SANDBOX_ROOT) throw new Error(`Refusing protected operation for unexpected root ${root}. Expected ${EXPECTED_SANDBOX_ROOT}.`)
  return root
}

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
  assertProtectedSandboxRoot(poolPrefix)
  if (!outputs?.auth?.user_pool_id || !outputs?.data?.url) throw new Error('Amplify outputs are incomplete.')
  return poolPrefix
}
