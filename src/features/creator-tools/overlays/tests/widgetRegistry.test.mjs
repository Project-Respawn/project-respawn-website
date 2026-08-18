import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { defineWidget } from '../../widgets/registry/definition.js'

test('registry declares the approved stable widget types without persisted component names', async () => {
  const paths=['utility/text','utility/image','chat/twitch-chat','alerts/alerts','tts-audio/tts','goals/goal','engagement/mission','brand-sponsor/sponsor','achievements/achievement','events/upcoming-event']
  const sources=await Promise.all(paths.map(path=>readFile(new URL(`../../widgets/${path}/widget.js`,import.meta.url),'utf8')))
  const source=sources.join('\n')
  for(const type of ['text','image','twitch-chat','alerts','tts','goal','mission','sponsor','achievement','upcoming-event']) assert.match(source,new RegExp(`type\\s*:\\s*['\"]${type}['\"]`))
  assert.match(source,/component\s*:\s*TextWidget/);assert.doesNotMatch(source,/componentName/)
  const adapter=await readFile(new URL('../widgetRegistry.js',import.meta.url),'utf8')
  assert.match(adapter,/widgets\/registry\/index\.js/)
})

test('registry normalizes interaction capabilities and minimum sizes', () => {
  const definition = defineWidget({ type: 'test', defaultSize: { width: 200, height: 100 }, minimumSize: { width: 120 }, defaultSettings: {} })
  assert.equal(definition.capabilities.draggable, true)
  assert.equal(definition.capabilities.resizable, true)
  assert.deepEqual(definition.minimumSize, { width: 120, height: 50 })
})
