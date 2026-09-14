import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  chooseCreatorBrandId,
  creatorContextMatches,
  creatorRequestIsCurrent,
  creatorRouteLocation,
  resolveCreatorBrand,
} from '../composables/useCreatorBrandContext.js'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')
const brandA = { brandId: 'brand-a', workspaceId: 'workspace-a', name: 'Brand A' }
const brandB = { brandId: 'brand-b', workspaceId: 'workspace-b', name: 'Brand B' }

test('zero, one, and multiple Brand selection never guess among multiple Brands', () => {
  assert.equal(chooseCreatorBrandId({ brands: [] }), '')
  assert.equal(chooseCreatorBrandId({ brands: [brandA] }), 'brand-a')
  assert.equal(chooseCreatorBrandId({ brands: [brandA, brandB] }), '')
})

test('route and explicit Brand choices are validated against accessible Brands', () => {
  const access = { brands: [brandA, brandB] }
  assert.equal(chooseCreatorBrandId(access, 'brand-b', 'brand-a'), 'brand-b')
  assert.equal(chooseCreatorBrandId(access, 'missing', 'brand-a'), '')
  assert.deepEqual(resolveCreatorBrand(access, 'brand-b'), {
    brand: brandB,
    brandId: 'brand-b',
    workspaceId: 'workspace-b',
  })
  assert.equal(resolveCreatorBrand(access, 'missing'), null)
})

test('Creator Tools navigation preserves only a selected Brand context', () => {
  assert.deepEqual(creatorRouteLocation('CreatorTwitchAlerts', 'brand-a'), {
    name: 'CreatorTwitchAlerts',
    query: { brandId: 'brand-a' },
  })
  assert.deepEqual(creatorRouteLocation('CreatorDashboard'), { name: 'CreatorDashboard' })
})

test('captured action context rejects results after a Brand switch', () => {
  const captured = { workspaceId: 'workspace-a', brandId: 'brand-a' }
  assert.equal(creatorContextMatches(captured, 'workspace-a', 'brand-a'), true)
  assert.equal(creatorContextMatches(captured, 'workspace-b', 'brand-b'), false)
  assert.equal(creatorRequestIsCurrent(2, 2, captured, 'workspace-a', 'brand-a'), true)
  assert.equal(creatorRequestIsCurrent(1, 2, captured, 'workspace-a', 'brand-a'), false)
  assert.equal(creatorRequestIsCurrent(2, 2, captured, 'workspace-b', 'brand-b'), false)
})

test('layout and sidebar render canonical Brand state without placeholder UI', async () => {
  const [layout, sidebar, header] = await Promise.all([
    read('../components/CreatorLayout.vue'),
    read('../components/CreatorSidebar.vue'),
    read('../components/CreatorContextHeader.vue'),
  ])
  assert.match(layout, /useCreatorBrandContext/)
  assert.match(layout, /:selected-brand="brandContext\.selectedBrand\.value"/)
  assert.match(sidebar, /v-for="item in brands"/)
  assert.match(sidebar, /@click="selectBrand\(item\.brandId \|\| item\.id\)"/)
  assert.match(sidebar, /No Brand available/)
  assert.match(sidebar + header, /creatorRouteLocation/)
  assert.doesNotMatch(layout + sidebar + header, /Sea Guardian/)
})

test('route changes are watched and inaccessible route Brands clear selection', async () => {
  const context = await read('../composables/useCreatorBrandContext.js')
  assert.match(context, /watch\([\s\S]*route\?\.query\?\.brandId/)
  assert.match(context, /if \(!resolved\) \{[\s\S]*clearSelection\('Select an accessible Brand'\)/)
  assert.match(context, /select\(requested, \{ updateRoute: false \}\)/)
})

test('Alerts follows shared context, clears old state, and guards loads, saves, and tests', async () => {
  const alerts = await read('../views/twitch/alerts/TwitchAlerts.vue')
  assert.doesNotMatch(alerts, /class="field brand-selector"/)
  assert.match(alerts, /watch\(\[workspaceId,brandId\]/)
  assert.match(alerts, /loadGeneration/)
  assert.match(alerts, /creatorRequestIsCurrent\(generation,loadGeneration,context/)
  assert.match(alerts, /clearBrandState\(\)/)
  assert.match(alerts, /updateTwitchOverlayConfig\(context\.workspaceId,context\.brandId/)
  assert.match(alerts, /getActiveOverlayPublication\(context\.workspaceId,context\.brandId\)/)
  assert.match(alerts, /if\(!isCurrentContext\(context\)\)return/)
  assert.match(alerts, /sendOverlayTestEvent/)
})
