import assert from 'node:assert/strict'
import test from 'node:test'
import { compareOperations, frontendOperations, hasContractErrors, outputOperations, schemaOperations } from './lib/amplify-contract.mjs'
import { EXPECTED_SANDBOX_ROOT, assertProtectedSandboxRoot, resolveSandboxRoot, validateEnvironmentDescriptor } from './lib/local-amplify-environment.mjs'

const schema = schemaOperations(`    getMyAccessContext: a.query()\n    listPublicMerchProducts: a.query()\n    saveThing: a.mutation()`)
const frontend = frontendOperations([`client.queries.getMyAccessContext(); client.queries.listPublicMerchProducts(); client.mutations.saveThing()`])
const completeOutputs = { data: { model_introspection: { queries: { getMyAccessContext: {}, listPublicMerchProducts: {} }, mutations: { saveThing: {} } } } }

test('complete operation contract passes', () => assert.equal(hasContractErrors(compareOperations(schema, frontend, outputOperations(completeOutputs))), false))
for (const missing of ['getMyAccessContext', 'listPublicMerchProducts']) {
  test(`missing ${missing} is rejected`, () => {
    const fixture = structuredClone(completeOutputs)
    delete fixture.data.model_introspection.queries[missing]
    assert.equal(hasContractErrors(compareOperations(schema, frontend, outputOperations(fixture))), true)
  })
}
test('stale output operation is rejected', () => {
  const fixture = structuredClone(completeOutputs)
  fixture.data.model_introspection.queries.removedQuery = {}
  assert.equal(hasContractErrors(compareOperations(schema, frontend, outputOperations(fixture))), true)
})
test('operation casing mismatch is rejected', () => {
  const fixture = structuredClone(completeOutputs)
  delete fixture.data.model_introspection.queries.getMyAccessContext
  fixture.data.model_introspection.queries.getmyaccesscontext = {}
  assert.equal(hasContractErrors(compareOperations(schema, frontend, outputOperations(fixture))), true)
})

const sandbox = (suffix) => `amplify-projectrespawnwebsite-Ntgrestage8-sandbox-${suffix}`
const descriptor = (poolStackName = `${EXPECTED_SANDBOX_ROOT}-auth123-A`, apiStackName = `${EXPECTED_SANDBOX_ROOT}-data123-B`, type = 'sandbox') => ({
  outputs: { auth: { user_pool_id: 'fixture' }, data: { url: 'https://fixture/graphql' } },
  poolTags: { 'amplify:deployment-type': type }, apiTags: { 'amplify:deployment-type': type }, poolStackName, apiStackName,
})

test('matching protected sandbox passes', () => assert.doesNotThrow(() => validateEnvironmentDescriptor(descriptor())))
test('protected root derivation is exact', () => assert.equal(resolveSandboxRoot(), EXPECTED_SANDBOX_ROOT))
for (const suffix of ['583d036e70', 'b3e3a9eb96', '8bd9d02332']) {
  test(`forbidden sandbox ${suffix} is rejected`, () => assert.throws(() => assertProtectedSandboxRoot(sandbox(suffix)), /unexpected root/))
}
test('omitted protected identifier is rejected', () => assert.throws(() => resolveSandboxRoot('project-respawn-website', ''), /identifier/))
test('wrong sandbox is rejected', () => assert.throws(() => validateEnvironmentDescriptor(descriptor('amplify-projectrespawnwebsite-Other-sandbox-current-auth123-A')), /does not belong/))
test('staging is rejected', () => assert.throws(() => validateEnvironmentDescriptor(descriptor('amplify-app-staging-auth123-A', 'amplify-app-staging-data123-B', 'branch')), /not an Amplify sandbox/))
test('production is rejected', () => assert.throws(() => validateEnvironmentDescriptor(descriptor('amplify-app-master-auth123-A', 'amplify-app-master-data123-B', 'branch')), /not an Amplify sandbox/))
test('mixed deployments are rejected', () => assert.throws(() => validateEnvironmentDescriptor(descriptor(`${sandbox('one')}-auth123-A`, `${sandbox('two')}-data123-B`)), /different sandbox/))
