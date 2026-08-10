import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { EXPECTED_SANDBOX_IDENTIFIER, validateEnvironmentDescriptor } from './lib/local-amplify-environment.mjs'

const outputsPath = path.resolve(process.cwd(), 'amplify_outputs.json')
const awsCommand = process.platform === 'win32' ? 'aws.exe' : 'aws'

function fail(message) {
  throw new Error(
    `Local Amplify output validation failed: ${message}\n`
    + 'Do not recreate or switch sandboxes. Inspect the protected Ntgrestage8 deployment and run the preflight before any in-place update.'
  )
}

function awsJson(args) {
  try {
    return JSON.parse(execFileSync(awsCommand, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
  } catch (error) {
    const detail = error?.stderr?.toString().trim()
    fail(`AWS read-only verification could not run.${detail ? ` ${detail}` : ''}`)
  }
}

if (!fs.existsSync(outputsPath)) fail('amplify_outputs.json is missing.')

let outputs
try {
  outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'))
} catch {
  fail('amplify_outputs.json is not valid JSON.')
}

const userPoolId = String(outputs?.auth?.user_pool_id || '')
const region = String(outputs?.auth?.aws_region || outputs?.data?.aws_region || '')
const graphqlUrl = String(outputs?.data?.url || '')
const requiredQueries = ['getMyAccessContext', 'listPublicMerchProducts']

if (!userPoolId) fail('auth.user_pool_id is missing.')
if (!region) fail('the AWS region is missing.')
if (!/^https:\/\/[^/]+\.appsync-api\.[^/]+\.amazonaws\.com\/graphql$/i.test(graphqlUrl)) {
  fail('data.url is not an AppSync GraphQL endpoint.')
}
for (const query of requiredQueries) {
  if (!outputs?.data?.model_introspection?.queries?.[query]) fail(`model_introspection does not contain ${query}.`)
}

const pool = awsJson([
  'cognito-idp', 'describe-user-pool', '--user-pool-id', userPoolId, '--region', region,
  '--query', 'UserPool.{Arn:Arn}', '--output', 'json',
])
const poolTags = awsJson([
  'cognito-idp', 'list-tags-for-resource', '--resource-arn', pool.Arn, '--region', region,
  '--query', 'Tags', '--output', 'json',
])

const graphqlApis = awsJson([
  'appsync', 'list-graphql-apis', '--region', region, '--query', 'graphqlApis', '--output', 'json',
])
const graphqlApi = graphqlApis.find((api) => api?.uris?.GRAPHQL === graphqlUrl)
if (!graphqlApi?.arn) fail('the AppSync endpoint is not present in the authenticated AWS account/region.')

const apiTags = awsJson([
  'appsync', 'list-tags-for-resource', '--resource-arn', graphqlApi.arn, '--region', region,
  '--query', 'tags', '--output', 'json',
])
const apiStackResources = awsJson([
  'cloudformation', 'describe-stack-resources', '--physical-resource-id', graphqlApi.arn, '--region', region,
  '--query', "StackResources[?ResourceType=='AWS::AppSync::GraphQLApi']", '--output', 'json',
])
const apiStackName = String(apiStackResources?.[0]?.StackName || '')
for (const query of requiredQueries) {
  const resolver = awsJson([
    'appsync', 'get-resolver', '--api-id', graphqlApi.apiId, '--type-name', 'Query',
    '--field-name', query, '--region', region,
    '--query', 'resolver.{fieldName:fieldName,kind:kind}', '--output', 'json',
  ])
  if (resolver?.fieldName !== query) fail(`the live sandbox AppSync API does not expose a ${query} resolver.`)
}

let deployment
try {
  deployment = validateEnvironmentDescriptor({
    outputs, poolTags, apiTags,
    poolStackName: String(poolTags?.['aws:cloudformation:stack-name'] || ''), apiStackName,
  })
} catch (error) {
  fail(error.message)
}

const authResources = awsJson([
  'cloudformation', 'describe-stack-resources', '--stack-name', poolTags['aws:cloudformation:stack-name'],
  '--region', region, '--query', 'StackResources', '--output', 'json',
])
if (!authResources.some((resource) => resource.ResourceType === 'AWS::Cognito::UserPoolClient' && resource.PhysicalResourceId === outputs.auth.user_pool_client_id)) {
  fail('the configured Cognito client does not belong to the protected auth stack.')
}
if (!authResources.some((resource) => resource.ResourceType === 'AWS::Cognito::IdentityPool' && resource.PhysicalResourceId === outputs.auth.identity_pool_id)) {
  fail('the configured identity pool does not belong to the protected auth stack.')
}

const bucketName = String(outputs?.storage?.bucket_name || '')
if (!bucketName) fail('storage.bucket_name is missing.')
const bucketResources = awsJson([
  'cloudformation', 'describe-stack-resources', '--physical-resource-id', bucketName, '--region', region,
  '--query', "StackResources[?ResourceType=='AWS::S3::Bucket']", '--output', 'json',
])
const bucketStackName = String(bucketResources?.[0]?.StackName || '')
if (!bucketStackName.startsWith(`${deployment}-storage`)) fail('the storage bucket belongs to a different deployment.')

console.log(`Local Amplify outputs verified for sandbox ${EXPECTED_SANDBOX_IDENTIFIER}.`)
console.log(`Cognito user pool: ${userPoolId}`)
console.log(`AppSync endpoint: ${graphqlUrl}`)
console.log(`Storage bucket: ${bucketName}`)
console.log(`Custom queries available: ${requiredQueries.join(', ')}`)
