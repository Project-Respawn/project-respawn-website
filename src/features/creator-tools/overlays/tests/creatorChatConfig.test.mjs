import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createDefaultChatSettings } from '../../views/chat/chat.defaults.js'
import { normalizeCreatorChatConfig, toCanonicalChatConfig, validateCreatorChatConfig } from '../../views/chat/chat.config.js'
import { resolveCreatorBrand } from '../../composables/useCreatorBrandContext.js'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('missing and legacy Chat configurations normalize into the versioned frontend contract', () => {
  const defaults = createDefaultChatSettings()
  assert.deepEqual(normalizeCreatorChatConfig().content, defaults.content)
  const legacy = normalizeCreatorChatConfig({ enabled: false, maxMessages: 23, platforms: ['YouTube', 'Twitch'], blockedTerms: ['spam'] })
  assert.equal(legacy.schemaVersion, 2)
  assert.equal(legacy.enabled, false)
  assert.equal(legacy.content.maximumVisibleMessages, 23)
  assert.equal(legacy.sources.twitch.enabled, true)
  assert.equal(legacy.sources.youtube.enabled, true)
  assert.equal(legacy.sources.tiktok.enabled, false)
  assert.deepEqual(legacy.blockedTerms, ['spam'])
})

test('canonical Chat round trip preserves Moderation terms and rejects invalid client values', () => {
  const previous = normalizeCreatorChatConfig({ blockedTerms: ['moderated-word'] })
  const settings = createDefaultChatSettings()
  settings.content.maximumVisibleMessages = 42
  const saved = toCanonicalChatConfig(settings, previous)
  assert.equal(saved.content.maximumVisibleMessages, 42)
  assert.deepEqual(saved.blockedTerms, ['moderated-word'])
  assert.deepEqual(validateCreatorChatConfig(saved), saved)
  assert.throws(() => toCanonicalChatConfig({ ...settings, sources: { ...settings.sources, unknown: { enabled: true } } }, previous), /unknown source|unsupported value/)
  assert.throws(() => toCanonicalChatConfig({ ...settings, content: { ...settings.content, maximumVisibleMessages: 101 } }, previous), /unsupported value/)
})

test('explicit selected Brand resolution isolates workspace and Brand pairs', () => {
  const access = { brands: [
    { brandId: 'brand-a', workspaceId: 'workspace-a', name: 'A' },
    { brandId: 'brand-b', workspaceId: 'workspace-b', name: 'B' },
  ] }
  assert.deepEqual(resolveCreatorBrand(access, 'brand-b'), { brand: access.brands[1], brandId: 'brand-b', workspaceId: 'workspace-b' })
  assert.equal(resolveCreatorBrand(access, 'brand-c'), null)
})

test('Creator Chat save preserves sibling config and only clears dirty after success', async () => {
  const page = await read('../../views/chat/CreatorChat.vue')
  assert.match(page, /\{ \.\.\.canonicalConfig\.value, chat \}/)
  assert.match(page, /const result = await updateTwitchOverlayConfig[\s\S]*canonicalConfig\.value = result\.config[\s\S]*isDirty\.value = false/)
  assert.match(page, /catch \(error\) \{[\s\S]*isDirty\.value = true/)
  assert.match(page, /applyPreset[\s\S]*isDirty\.value =[\s\S]*true/)
  assert.doesNotMatch(page, /localStorage|sessionStorage|autosave/i)
})

test('Browser Source forwards refreshed Chat config and twitch-chat prefers canonical runtime config', async () => {
  const [source, renderer, widget, preview] = await Promise.all([
    read('../../views/overlays/OverlayBrowserSource.vue'),
    read('../../components/overlays/OverlaySceneRenderer.vue'),
    read('../../widgets/chat/twitch-chat/ChatWidget.vue'),
    read('../../views/chat/ChatLivePreview.vue'),
  ])
  assert.match(source, /runtimeConfig\.value = \{ \.\.\.\(source\.twitchConfig/)
  assert.match(source, /30_000/)
  assert.match(renderer, /:runtime-config="runtimeConfig"/)
  assert.match(widget, /props\.runtimeConfig\?\.chat \|\| legacyConfig\(\)/)
  assert.match(widget, /normalizeCreatorChatConfig/)
  assert.match(preview, /normalizeCreatorChatConfig/)
  assert.match(widget, /value\.maxMessages/)
})
