import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import * as Vue from 'vue'
import { parse, compileScript } from '@vue/compiler-sfc'
import { normalizeCreatorChatConfig } from '../../views/chat/chat.config.js'
import { createWidgetEventBus } from '../widgetEventBus.js'
import { createTestOverlayEvent, toWidgetEvent } from '../overlayEventContract.js'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')
const source = await read('../../widgets/chat/twitch-chat/ChatWidget.vue')
const editor = await read('../../views/overlays/OverlayEditor.vue')
const widgetEventBus = createWidgetEventBus()
function mountedChat(mode = 'editor-preview') {
  let mount, unmount
  const props = Vue.reactive({ widget: { id: 'chat', type: 'twitch-chat', enabled: true, settings: {} }, runtimeMode: mode, runtimeConfig: { chat: normalizeCreatorChatConfig({}) } })
  const { content } = compileScript(parse(source).descriptor, { id: 'chat-runtime', inlineTemplate: true, genDefaultAs: 'component' })
  const code = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]vue['"];?/g, (_, names) => `const {${names.replace(/\bas\b/g, ':')}} = Vue;`).replace(/^import .*$/gm, '')
  const component = runInNewContext(code + '\ncomponent', { Vue: { ...Vue, inject: () => null, onMounted: fn => { mount = fn }, onBeforeUnmount: fn => { unmount = fn } }, widgetEventBus, normalizeCreatorChatConfig, setTimeout: () => 1, clearTimeout() {} })
  const scope = Vue.effectScope(), render = scope.run(() => component.setup(props, { expose() {} }))
  mount()
  const text = node => typeof node === 'string' ? node : Array.isArray(node?.children) ? node.children.map(text).join('') : typeof node?.children === 'string' ? node.children : ''
  return { props, text: () => text(render({}, [])), stop() { unmount(); scope.stop() } }
}

test('Builder Test Chat injects locally and renders without publication or Twitch access', () => {
  const chat = mountedChat()
  const start = editor.indexOf('function testOverlayChatOrSource'), end = editor.indexOf('\nfunction ', start + 10)
  const local = runInNewContext(editor.slice(start, end) + '\ntestOverlayChatOrSource', { selectedWidget: Vue.ref(chat.props.widget), scene: Vue.ref({ widgets: [chat.props.widget] }), notice: Vue.ref(''), widgetEventBus, createTestOverlayEvent, toWidgetEvent, sendSourceTest: () => { throw Error('Chat must remain local') } })
  local('chat.message')
  assert.match(chat.text(), /RespawnTester/)
  assert.match(chat.text(), /Project Respawn Browser Source test/)
  chat.stop()
})

test('the same chat renderer handles canonical events, bursts, duplicates, filtering and disable/removal', () => {
  for (const mode of ['editor-preview', 'browser-source']) {
    const chat = mountedChat(mode)
    assert.doesNotMatch(chat.text(), /RespawnTester/)
    if (mode === 'browser-source') assert.doesNotMatch(chat.text(), /No messages yet|Local chat preview/)
    const event = toWidgetEvent(createTestOverlayEvent('chat.message', { id: mode }))
    widgetEventBus.publish(event); widgetEventBus.publish(event)
    widgetEventBus.publish({ ...event, id: mode + '2', payload: { text: 'Second message' } })
    assert.equal(chat.text().split('RespawnTester').length - 1, 2)
    assert.match(chat.text(), /Second message/)
    widgetEventBus.publish({ ...event, id: 'wrong-target', targetWidgetId: 'other', payload: { text: 'Wrong target' } })
    assert.doesNotMatch(chat.text(), /Wrong target/)
    chat.props.widget.enabled = false
    widgetEventBus.publish({ ...event, id: 'disabled', payload: { text: 'While disabled' } })
    assert.doesNotMatch(chat.text(), /While disabled/)
    chat.props.widget.enabled = true
    chat.props.runtimeConfig.chat.enabled = false
    assert.doesNotMatch(chat.text(), /Second message/)
    chat.stop()
    widgetEventBus.publish({ ...event, id: 'removed', payload: { text: 'After removal' } })
    assert.doesNotMatch(chat.text(), /After removal/)
  }
})

test('editor live subscription is Brand-bound, discards stale callbacks, and exposes safe offline/error states', async () => {
  const source = await read('../../composables/useOverlayChatPreview.js')
  const events = [], sockets = []
  let connected = true, healthy = true, fail = false, wrongBrand = false, unmount
  const usePreview = runInNewContext(source.replace(/^import .*$/gm, '').replace('export function', 'function') + '\nuseOverlayChatPreview', {
    ...Vue, onBeforeUnmount: fn => { unmount = fn }, generateClient: () => ({}), URL,
    getTwitchOverlayConfig: async () => ({ config: { chat: { enabled: true } } }),
    getTwitchConnectionStatus: async () => { if (fail) throw Error('private diagnostic'); return { connected, health: { chatReadAvailable: healthy } } },
    getActiveOverlayPublication: async (workspaceId, brandId) => ({ publication: { workspaceId, brandId: wrongBrand ? 'other' : brandId, browserSourceUrl: 'https://example.test/overlay-source/test-only' } }),
    fetchOverlaySource: async () => ({ websocketUrl: 'wss://example.test' }),
    createOverlaySourceConnection: options => { const socket = { ...options, close() { socket.closed = true } }; sockets.push(socket); return socket },
    widgetEventBus: { publish: event => events.push(event) },
  })
  const workspace = Vue.ref('workspace'), brand = Vue.ref('brand'), url = Vue.ref('')
  const scope = Vue.effectScope(), state = scope.run(() => usePreview(workspace, brand, url))
  const settle = async () => { await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve)) }
  await settle()
  assert.equal(sockets.length, 1)
  sockets[0].onEvent({ topic: 'stream.follow' }); assert.equal(events.length, 0)
  sockets[0].onEvent({ topic: 'chat.message' }); assert.equal(events.length, 1)
  brand.value = 'brand2'; await settle()
  assert.equal(sockets[0].closed, true)
  sockets[0].onEvent({ topic: 'chat.message' }); assert.equal(events.length, 1)
  sockets[1].onEvent({ topic: 'chat.message' }); assert.equal(events.length, 2)
  connected = false; url.value = 'reload1'; await settle(); assert.match(state.status.value, /Twitch not connected/)
  connected = true; healthy = false; url.value = 'reload2'; await settle(); assert.match(state.status.value, /Chat connection unavailable/)
  healthy = true; wrongBrand = true; url.value = 'reload3'; await settle(); assert.match(state.status.value, /Could not load live chat/)
  assert.equal(sockets.length, 2)
  wrongBrand = false; fail = true; url.value = 'reload4'; await settle(); assert.doesNotMatch(state.status.value, /private diagnostic/)
  unmount(); scope.stop()
})
