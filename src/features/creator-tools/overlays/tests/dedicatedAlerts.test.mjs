import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { parse, compileScript } from '@vue/compiler-sfc'
import { ALERT_WIDGETS, ALERT_BEHAVIOR_KEYS } from '../alertWidgets.js'
import { ALERT_KINDS, ALERT_ANIMATIONS, normalizeAlertConfiguration, previewEventForKind } from '../alertPresentation.js'
import { createPublicationSceneSnapshot } from '../overlayPublicationSnapshot.js'
import { createWidgetEventBus } from '../widgetEventBus.js'
import { createTriggeredWidgetSubscription } from '../triggeredWidgetState.js'
import { defineWidget, commonStyleSettings } from '../../widgets/registry/definition.js'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(code)).toString('base64')}`
const domainUrl = moduleUrl(await read('../../../../../amplify/overlaySource/domain.ts'))
const domain = await import(domainUrl)
const publisher = await import(moduleUrl((await read('../../../../../amplify/overlaySource/canonicalPublisher.ts')).replace("'./domain'", JSON.stringify(domainUrl))))
const sample = type => ({ id: type, type, enabled: true, displayMode: 'always', frame: { x: 10, y: 20, width: 700, height: 220 }, settings: Object.fromEntries(ALERT_BEHAVIOR_KEYS.map(key => [key, 'must not persist'])), dataSource: { topics: ['wrong.topic'] } })

test('all five dedicated registry widgets share presentation and have one canonical topic', async () => {
  const factory = (await read('../../widgets/alerts/dedicatedAlert.js')).replace(/^import .*$/gm, '').replace('export function', 'function')
  const defineAlertWidget = runInNewContext(factory + '\ndefineAlertWidget', { defineWidget, commonStyleSettings, ALERT_WIDGETS, AlertWidget: {} })
  const registry = await read('../../widgets/registry/index.js')
  for (const [type, alert] of Object.entries(ALERT_WIDGETS)) {
    const definitionSource = await read(`../../widgets/alerts/${type}/widget.js`)
    assert.ok(registry.includes(`../alerts/${type}/widget.js`))
    const definition = runInNewContext(definitionSource.replace(/^import .*$/gm, '').replace('export default', ''), { defineAlertWidget })
    assert.equal(definition.displayName, alert.name)
    assert.deepEqual([...definition.topics], [alert.topic])
    assert.equal(definition.displayMode, 'triggered')
    assert.equal(Object.keys(definition.defaultSettings).some(key => ALERT_BEHAVIOR_KEYS.includes(key)), false)
  }
  assert.match(await read('../../components/overlays/WidgetLibrary.vue'), /filter\(widget => widget.type !== 'alerts'\)/)
  assert.ok(registry.includes("../alerts/alerts/widget.js"))
})

test('snapshot, backend validation and event fanout isolate every dedicated alert and preserve legacy alerts', async () => {
  const snapshot = createPublicationSceneSnapshot({ id: 'scene', resolution: { width: 1920, height: 1080 }, widgets: Object.keys(ALERT_WIDGETS).map(sample) })
  const validated = domain.validateSceneSnapshot(snapshot)
  for (const widget of validated.widgets) {
    assert.equal(widget.displayMode, 'triggered')
    assert.deepEqual(widget.dataSource.topics, [ALERT_WIDGETS[widget.type].topic])
    assert.equal(Object.keys(widget.settings).length, 0)
    assert.equal(widget.frame.x, 10)
  }
  for (const provider of ['twitch', 'test']) for (const alert of Object.values(ALERT_WIDGETS)) {
    const bus = createWidgetEventBus(), activated = []
    const disposers = validated.widgets.map(widget => createTriggeredWidgetSubscription(widget, { bus, onVisibility: visible => { if (visible) activated.push(widget.type) }, setTimer: () => 1, clearTimer() {}, runtimeSettings: { enabled: true, duration: 2 } }))
    const result = await publisher.publishCanonicalOverlayEvent({ workspaceId: 'w', brandId: 'b', event: { type: alert.topic, source: provider } }, {
      getActivePublication: async () => ({ publicationId: 'same-publication', workspaceId: 'w', brandId: 'b', status: 'TEST', sceneSnapshot: validated }),
      getConfigRevision: async () => 3, listConnections: async () => [{ connectionId: 'obs', expiresAtEpoch: Date.now() / 1000 + 60 }],
      send: async (id, event) => bus.publish({ topic: event.type, provider: event.source }), remove: async () => {},
    })
    assert.equal(result.delivered, 1)
    assert.deepEqual(activated, [Object.keys(ALERT_WIDGETS).find(type => ALERT_WIDGETS[type] === alert)])
    disposers.forEach(dispose => dispose())
  }
  assert.deepEqual(domain.activeAlertTopics([{ type: 'alerts', dataSource: { topics: ['stream.follow'] } }]), ['stream.follow'])
  assert.equal(domain.hasActiveAlertWidget([{ type: 'alerts' }]), true)
})

test('Twitch Alerts and Overlay Builder edit the same Brand configuration in both directions', async () => {
  let record = domain.validateTwitchOverlayConfig({}), revision = 1
  const getTwitchOverlayConfig = async (workspace, brand) => { assert.equal(workspace, 'w'); assert.equal(brand, 'b'); return { config: structuredClone(record), revision } }
  const updateTwitchOverlayConfig = async (workspace, brand, config) => { assert.equal(workspace, 'w'); assert.equal(brand, 'b'); record = domain.validateTwitchOverlayConfig(config); return { config: structuredClone(record), revision: ++revision } }
  const workspaceId = Vue.ref('w'), brandId = Vue.ref('b')
  const pageSource = parse(await read('../../views/twitch/alerts/TwitchAlerts.vue')).descriptor.scriptSetup.content
  const scope = Vue.effectScope()
  const page = scope.run(() => runInNewContext(pageSource.replace(/^import .*$/gm, '') + '\n;({loadBrandState,saveSettings,configs})', {
    ...Vue, ALERT_ANIMATIONS, normalizeAlertConfiguration, previewEventForKind, getTwitchOverlayConfig, updateTwitchOverlayConfig,
    getActiveOverlayPublication: async () => ({ publication: null }), useRoute: () => ({}), useRouter: () => ({}),
    useCreatorBrandContext: () => ({ workspaceId, selectedBrandId: brandId, selectedBrand: Vue.ref(null), load: async () => {}, error: Vue.ref('') }),
    creatorContextMatches: (context, workspace, brand) => context.workspaceId === workspace && context.brandId === brand,
    creatorRequestIsCurrent: (request, generation, context, workspace, brand) => request === generation && context.workspaceId === workspace && context.brandId === brand,
  }))
  await page.loadBrandState()
  page.configs.follow.titleTemplate = '{user} joined!'
  assert.equal(await page.saveSettings(), true)
  const editorSource = (await read('../../composables/useOverlayAlertSettings.js')).replace(/^import .*$/gm, '').replace('export function', 'function')
  const useSettings = runInNewContext(editorSource + '\nuseOverlayAlertSettings', { ...Vue, ALERT_KINDS, normalizeAlertConfiguration, getTwitchOverlayConfig, updateTwitchOverlayConfig })
  const editor = scope.run(() => useSettings(workspaceId, brandId))
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(editor.configs.value.follow.titleTemplate, '{user} joined!')
  editor.configs.value.follow.titleTemplate = 'Welcome {user}!'
  assert.equal(editor.dirty.value, true)
  record.alerts.raid.titleTemplate = 'Preserve other alert'
  assert.equal(await editor.save('follow'), true)
  assert.equal(record.alerts.raid.titleTemplate, 'Preserve other alert')
  assert.equal(editor.dirty.value, false)
  await page.loadBrandState()
  assert.equal(page.configs.follow.titleTemplate, 'Welcome {user}!')
  scope.stop()
})

test('dedicated previews map canonical config and share local presentation without live event calls', async () => {
  const widget = await read('../../widgets/alerts/DedicatedAlertWidget.vue')
  const panel = await read('../../components/overlays/OverlayAlertSettings.vue')
  const page = await read('../../views/twitch/alerts/TwitchAlerts.vue')
  for (const alert of Object.values(ALERT_WIDGETS)) assert.equal(previewEventForKind(alert.kind).topic, alert.topic)
  assert.match(widget, /runtimeConfig\?\.alerts\?\.\[alert.kind\]/)
  for (const source of [widget, panel, page]) assert.match(source, /AlertPresentation/)
  assert.match(panel, /previewEventForKind/)
  assert.doesNotMatch(panel, /sendOverlayTestEvent|widgetEventBus|updateOverlayPublication|createOverlayPublication|widget\.settings/)
  for (const [type, alert] of Object.entries(ALERT_WIDGETS)) {
    const configuration = { enabled: true, titleTemplate: alert.name }
    const props = { widget: sample(type), runtimeMode: 'editor-preview', runtimeConfig: { alerts: { [alert.kind]: configuration } } }
    const state = runInNewContext(parse(widget).descriptor.scriptSetup.content.replace(/^import .*$/gm, '') + '\n;({config,event})', {
      ...Vue, ALERT_WIDGETS, previewEventForKind, defineProps: () => props,
      useWidgetEvents(widget, initial) { assert.deepEqual([...widget.dataSource.topics], [alert.topic]); return Vue.ref(initial) },
    })
    assert.equal(state.config.value, configuration)
    assert.equal(state.event.value.topic, alert.topic)
  }
  for (const source of [widget, panel, page, await read('../../components/overlays/OverlaySceneRenderer.vue'), await read('../../components/overlays/OverlayBuilderInspector.vue'), await read('../../views/overlays/OverlayEditor.vue')]) {
    compileScript(parse(source).descriptor, { id: 'dedicated-alert-test', inlineTemplate: true })
  }
})

test('alert config failures retain drafts and in-flight saves do not discard newer edits', async () => {
  let fail = true, finish, writes = 0
  const source = (await read('../../composables/useOverlayAlertSettings.js')).replace(/^import .*$/gm, '').replace('export function', 'function')
  const config = domain.validateTwitchOverlayConfig({})
  const useSettings = runInNewContext(source + '\nuseOverlayAlertSettings', {
    ...Vue, ALERT_KINDS, normalizeAlertConfiguration,
    getTwitchOverlayConfig: async () => ({ config: structuredClone(config) }),
    updateTwitchOverlayConfig: async (workspace, brand, config) => { writes++; if (fail) throw new Error('Save failed'); return new Promise(resolve => { finish = () => resolve({ config }) }) },
  })
  const scope = Vue.effectScope(), editor = scope.run(() => useSettings(Vue.ref('w'), Vue.ref('b')))
  await new Promise(resolve => setImmediate(resolve))
  editor.configs.value.follow.titleTemplate = 'Pending'
  assert.equal(await editor.save('follow'), false)
  assert.equal(editor.dirty.value, true)
  assert.equal(editor.error.value, 'Save failed')
  fail = false
  const pending = editor.save('follow')
  await new Promise(resolve => setImmediate(resolve))
  editor.configs.value.follow.titleTemplate = 'Newer edit'
  assert.equal(await editor.save('follow'), false)
  finish(); await pending
  assert.equal(writes, 2)
  assert.equal(editor.configs.value.follow.titleTemplate, 'Newer edit')
  assert.equal(editor.dirty.value, true)
  scope.stop()
})
