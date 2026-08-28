import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { creatorChatSettings, normalizeCreatorChatConfig, toCanonicalChatConfig } from '../../views/chat/chat.config.js'
import { resolveCreatorBrand } from '../../composables/useCreatorBrandContext.js'

test('legacy Chat fields normalize into canonical v2 without losing moderation terms', () => {
  const chat = normalizeCreatorChatConfig({ enabled:false, maxMessages:23, platforms:['Twitch','Kick'], blockedTerms:['Spam'] })
  assert.equal(chat.schemaVersion, 2); assert.equal(chat.enabled, false)
  assert.equal(chat.content.maximumVisibleMessages, 23)
  assert.equal(chat.sources.twitch.enabled, true); assert.equal(chat.sources.kick.enabled, true); assert.equal(chat.sources.youtube.enabled, false)
  assert.deepEqual(chat.blockedTerms, ['Spam'])
})

test('missing Chat configuration uses complete current defaults without persisting a preset id', () => {
  const chat = normalizeCreatorChatConfig()
  for (const section of ['sources','content','appearance','behaviour','layout','typography']) assert.ok(chat[section])
  assert.equal(chat.schemaVersion, 2); assert.equal('presetId' in chat, false)
})

test('canonical round trip preserves blocked terms and excludes frontend preset state', () => {
  const previous = normalizeCreatorChatConfig({ blockedTerms:['keep-me'] })
  const settings = creatorChatSettings(previous); settings.content.showTimestamps = false
  const saved = toCanonicalChatConfig(settings, previous)
  assert.equal(saved.content.showTimestamps, false); assert.deepEqual(saved.blockedTerms, ['keep-me']); assert.equal('activePreset' in saved, false)
})

test('explicit Brand resolution never substitutes another accessible Brand', () => {
  const access = { workspaces:[{id:'workspace-a'},{id:'workspace-b'}], brands:[{brandId:'brand-a',workspaceId:'workspace-a'},{brandId:'brand-b',workspaceId:'workspace-b'}] }
  assert.deepEqual(resolveCreatorBrand(access, 'brand-b'), { brand:access.brands[1], brandId:'brand-b', workspaceId:'workspace-b' })
  assert.equal(resolveCreatorBrand(access, 'missing'), null)
})

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')
test('Creator Chat save preserves sibling config and only clears dirty state after success', async () => {
  const source = await read('../../views/chat/CreatorChat.vue')
  assert.match(source, /\{ \.\.\.canonicalConfig\.value, chat \}/)
  assert.match(source, /canonicalConfig\.value = result\.config[\s\S]*isDirty\.value = false/)
  assert.match(source, /catch \(error\)[\s\S]*isDirty\.value = true/)
  assert.doesNotMatch(source, /Save requested/); assert.doesNotMatch(source, /localStorage/)
})

test('runtime widget prefers canonical Chat v2 and keeps legacy fallback', async () => {
  const widget = await read('../../widgets/chat/twitch-chat/ChatWidget.vue')
  assert.match(widget, /runtimeConfig\?\.chat \|\| legacyConfig\(\)/)
  for (const section of ['sources','content','appearance','behaviour','layout','typography']) assert.match(widget, new RegExp(`chat(?:\\.value)?\\.${section}`))
})

test('Creator preview and Browser Source widget share the same normalizer', async () => {
  const [preview, widget] = await Promise.all([read('../../views/chat/ChatLivePreview.vue'), read('../../widgets/chat/twitch-chat/ChatWidget.vue')])
  assert.match(preview, /normalizeCreatorChatConfig/); assert.match(widget, /normalizeCreatorChatConfig/)
})
