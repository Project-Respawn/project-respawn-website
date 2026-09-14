import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../amplify/myFunction/resource.ts', import.meta.url), 'utf8')

test('Master Twitch OAuth uses only the Master API and production frontend', () => {
  const productionBranch = source.slice(
    source.indexOf("const twitchRedirectUri"),
    source.indexOf('// =============================================================================', source.indexOf("const twitchRedirectUri")),
  )
  assert.match(productionBranch, /isProductionBranch\s*\?\s*'https:\/\/g9eoo6e1h2\.execute-api\.eu-north-1\.amazonaws\.com\/twitch\/oauth\/callback'/)
  assert.match(productionBranch, /isProductionBranch\s*\?\s*'https:\/\/www\.projectrespawn\.com'/)
  assert.doesNotMatch(productionBranch.match(/isProductionBranch\s*\?[^:]+/g)?.join('\n') || '', /localhost|127\.0\.0\.1|9qp7ehd406|Ntgrestage8/)
})

test('non-Master synthesis retains the protected sandbox and local frontend configuration', () => {
  assert.match(source, /:\s*'https:\/\/9qp7ehd406\.execute-api\.eu-north-1\.amazonaws\.com\/twitch\/oauth\/callback'/)
  assert.match(source, /:\s*'http:\/\/localhost:5174'/)
})
