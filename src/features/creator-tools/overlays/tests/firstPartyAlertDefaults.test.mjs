import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { FIRST_PARTY_ALERT_DEFAULTS, resetAlertPresentationOverrides } from '../firstPartyAlertDefaults.js'
import { resolveAlertPresentation, previewEventForKind, normalizeAlertConfiguration } from '../alertPresentation.js'
import { createAlertAudioLifecycle } from '../alertAudioLifecycle.js'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')
const hashes = {
  'follow/image.jpg': 'e30216c1796ac0595bbb24ef74d9c047ccf4e2cb36f3f093801346934e593a3a',
  'follow/audio.mp3': 'f1b380c76f5c112d8ffbb57c9a9752cab8b55d0760fa2a22ea565ee4e97d4b8c',
  'subscription/image.jpg': 'bf5f6961652edfdbe6b40f21e33a5f9723679b9b736ea84e137e137e0b0646f8',
  'subscription/audio.mp3': '53447f388a5386863ab3721561dd67574b538961ab3883c5e0b88bca713eada0',
  'bits/image.jpg': '6047c13101c4eab8af9003ae961f0b5d2fda2ab4766d4f082c05c93a88de3dc0',
  'bits/audio.mp3': '9378845c8363c463de1314efd334f63681db7af00c7f406dcd408cc5f6d1c7d9',
  'raid/image.jpg': 'a4bec30e8bc78d9a5b70f482d43585d8bcb7e2216978388300d9af9672a50147',
  'raid/audio.mp3': '53be92689d9b866e51deaa1725b48a5698e46f7f6d66ba7f677686bd89cc0c16',
}

test('approved assets retain their exact bytes and hosting MIME rules cover both formats', async () => {
  for (const [path, expected] of Object.entries(hashes)) {
    const bytes = await readFile(new URL(`../../../../../public/twitch-alerts/${path}`, import.meta.url))
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, path)
  }
  const headers = await read('../../../../../customHttp.yml')
  assert.match(headers, /image\/jpeg/); assert.match(headers, /audio\/mpeg/)
})

test('each supplied kind inherits its own media, audio and copy without persisting resolved values', () => {
  for (const [kind, defaults] of Object.entries(FIRST_PARTY_ALERT_DEFAULTS)) {
    for (const empty of [undefined, null, {}, { mediaUrl: '', soundUrl: null, messageTemplate: '' }]) {
      const event = previewEventForKind(kind)
      const resolved = resolveAlertPresentation(event, empty)
      assert.equal(resolved.config.mediaUrl, `https://www.projectrespawn.com${defaults.mediaUrl}`)
      assert.equal(resolved.config.soundUrl, `https://www.projectrespawn.com${defaults.soundUrl}`)
      assert.equal(resolved.message, defaults.messageTemplate)
      assert.equal(resolved.config.duration, 20)
      assert.equal(normalizeAlertConfiguration(empty, kind).duration, 20)
      assert.equal(resolveAlertPresentation(event, { duration: 12 }).config.duration, 12)
      assert.deepEqual(resolveAlertPresentation({ ...event, provider: 'twitch' }, empty), resolved)
    }
    const raw = normalizeAlertConfiguration({})
    resolveAlertPresentation(previewEventForKind(kind), raw)
    assert.equal(raw.mediaUrl, ''); assert.equal(raw.soundUrl, ''); assert.equal(raw.messageTemplate, '')
  }
})

test('custom fields win independently and resetting removes overrides while preserving other settings', () => {
  const event = previewEventForKind('follow')
  const custom = { mediaUrl: 'https://creator.example/image.jpg', soundUrl: 'https://creator.example/sound.mp3', titleTemplate: 'Hello {user}', messageTemplate: 'Custom text', enabled: false, volume: 0, duration: 12 }
  const resolved = resolveAlertPresentation(event, custom)
  assert.equal(resolved.config.mediaUrl, custom.mediaUrl); assert.equal(resolved.config.soundUrl, custom.soundUrl)
  assert.equal(resolved.message, custom.messageTemplate); assert.equal(resolved.config.enabled, false); assert.equal(resolved.config.volume, 0)
  assert.equal(resolveAlertPresentation(event, { mediaUrl: custom.mediaUrl }).config.soundUrl, resolveAlertPresentation(event, {}).config.soundUrl)
  assert.equal(resolveAlertPresentation(event, { soundUrl: custom.soundUrl }).config.mediaUrl, resolveAlertPresentation(event, {}).config.mediaUrl)
  const reset = resetAlertPresentationOverrides('follow', custom)
  for (const key of ['mediaUrl', 'soundUrl', 'titleTemplate', 'messageTemplate']) assert.equal(reset[key], '')
  assert.equal(reset.duration, 20); assert.equal(reset.enabled, false); assert.equal(custom.messageTemplate, 'Custom text')
  assert.equal(resolveAlertPresentation(event, reset).config.duration, 20)
  assert.equal(resolveAlertPresentation(event, reset).message, 'Welcome to the Respawn!')
  assert.ok(resolveAlertPresentation(previewEventForKind('subscription'), {}).config.mediaUrl.includes('/subscription/'))
  assert.equal(resetAlertPresentationOverrides('redemption', custom), custom)
  const redemption = resolveAlertPresentation(previewEventForKind('redemption'), {})
  assert.equal(redemption.config.mediaUrl, ''); assert.equal(redemption.config.soundUrl, ''); assert.equal(redemption.message, '')
})

test('shared presentation survives asset failures and plays audio only on explicit triggers', async () => {
  const source = await read('../../components/overlays/AlertPresentation.vue')
  const { content } = compileScript(parse(source).descriptor, { id: 'asset-failure', inlineTemplate: true, genDefaultAs: 'component' })
  const code = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]vue['"];?/g, (_, names) => `const {${names.replace(/\bas\b/g, ':')}} = Vue;`).replace(/^import .*$/gm, '')
  const plays = [], failures = []
  class AudioFake { constructor(url) { this.url = url } play() { plays.push(this.url); return Promise.reject(new Error('Unavailable')) } pause() {} removeAttribute() {} load() {} }
  const component = runInNewContext(code + '\ncomponent', { Vue: { ...Vue, onBeforeUnmount: Vue.onScopeDispose }, resolveAlertPresentation, createAlertAudioLifecycle: () => createAlertAudioLifecycle({ AudioImpl: AudioFake, onError: error => failures.push(error.message) }) })
  const props = Vue.reactive({ event: previewEventForKind('follow'), configuration: {}, playAudio: false, exiting: false, style: {} })
  const scope = Vue.effectScope(), render = scope.run(() => component.setup(props, { expose() {} }))
  const nodes = node => !node || typeof node !== 'object' ? [] : [node, ...(Array.isArray(node.children) ? node.children.flatMap(nodes) : [])]
  const tree = () => render({}, [])
  assert.equal(plays.length, 0)
  nodes(tree()).find(node => node.type === 'img').props.onError()
  assert.equal(nodes(tree()).some(node => node.type === 'img'), false)
  assert.ok(nodes(tree()).some(node => node.type === 'p' && node.children === 'Welcome to the Respawn!'))
  props.playAudio = true; await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve))
  assert.equal(plays.length, 1); assert.equal(failures.length, 1)
  props.configuration = { soundUrl: 'https://creator.example/new.mp3' }; await Vue.nextTick()
  assert.equal(plays.length, 1, 'editing audio never autoplays it')
  props.event = { ...props.event, id: 'next-preview' }; await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve))
  assert.equal(plays[1], 'https://creator.example/new.mp3')
  scope.stop()
})

test('runtime duration fallback preserves legacy fields and Redemption settings', async () => {
  const source = await read('../../components/overlays/OverlaySceneRenderer.vue')
  const helper = source.slice(source.indexOf('function resolvedSettings'), source.indexOf('function widgetIsVisible'))
  const props = { runtimeConfig: { alerts: { follow: { messageTemplate: 'Legacy' }, subscription: { duration: 12, enabled: false }, redemption: { enabled: true } } } }
  const resolve = runInNewContext(helper + '\nresolvedSettings', { props, normalizeAlertConfiguration })
  assert.equal(resolve('follow').duration, 20)
  assert.equal(resolve('follow').messageTemplate, 'Legacy')
  assert.equal(resolve('follow').enabled, undefined)
  assert.equal(resolve('subscription').duration, 12)
  assert.equal(resolve('subscription').enabled, false)
  assert.equal(resolve('redemption'), props.runtimeConfig.alerts.redemption)
})

test('both editors expose reset and still render through the shared presentation', async () => {
  for (const path of ['../../components/overlays/OverlayAlertSettings.vue', '../../views/twitch/alerts/TwitchAlerts.vue']) {
    const source = await read(path)
    assert.match(source, /Reset to Default/); assert.match(source, /resetAlertPresentationOverrides/); assert.match(source, /AlertPresentation/)
    compileScript(parse(source).descriptor, { id: path, inlineTemplate: true })
  }
})
