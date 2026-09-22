import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const routes = fs.readFileSync(new URL('../src/router/public.routes.js', import.meta.url), 'utf8')
const routeText = routes.match(/\{\s*path: '\/SWG-EOF-test',[\s\S]*?component:[^\n]+\s*\}/)?.[0]
assert.ok(routeText, 'SWG route exists')
const route = vm.runInNewContext('(' + routeText + ')')
const source = fs.readFileSync(new URL('../src/router/index.js', import.meta.url), 'utf8')
const guardSource = source.slice(source.indexOf('router.beforeEach('), source.indexOf('export default router;'))

function guardFor({ signedIn = true, groups = [], fail = false } = {}) {
  let guard
  vm.runInNewContext(guardSource, {
    router: { beforeEach(fn) { guard = fn } },
    ensureAuthReady: async () => {},
    useAuth: () => ({ isSignedIn: { value: signedIn } }),
    refreshAccessContext: async () => {
      if (fail) throw new Error('Access service unavailable')
      return { groups, permissions: [], isPlatformAdmin: groups.includes('Admin') }
    },
    console: { error() {} },
  })
  return () => guard({ path: route.path, fullPath: route.path, matched: [route] })
}

test('anonymous visitors must sign in with return path', async () => {
  const result = await guardFor({ signedIn: false })()
  assert.equal(result.path, '/join')
  assert.equal(result.query.redirect, '/SWG-EOF-test')
})
test('ordinary members cannot open the test area', async () => {
  assert.equal((await guardFor({ groups: ['Member'] })()).path, '/')
})
test('BetaMember can open the test area', async () => {
  assert.equal(await guardFor({ groups: ['Member', 'BetaMember'] })(), true)
})
test('admin status alone does not bypass explicit beta membership', async () => {
  assert.equal((await guardFor({ groups: ['Admin', 'SuperAdmin'] })()).path, '/')
})
test('access service failure denies entry', async () => {
  assert.equal((await guardFor({ groups: ['BetaMember'], fail: true })()).path, '/')
})

const { swgSignInDestination } = await import('../src/config/swgEofRelease.js')
test('sign-in preserves the beta installer approval link', () => {
  const target = '/SWG-EOF-test?device=' + 'a'.repeat(32)
  assert.equal(swgSignInDestination(target), target)
  assert.equal(swgSignInDestination('/SWG-EOF-test'), '/SWG-EOF-test')
})
test('sign-in redirect rejects external and unrelated destinations', () => {
  for (const target of ['https://evil.example', '//evil.example', '/admin', '/SWG-EOF-test?device=bad', ['/SWG-EOF-test'], undefined]) {
    assert.equal(swgSignInDestination(target), '/home')
  }
})
