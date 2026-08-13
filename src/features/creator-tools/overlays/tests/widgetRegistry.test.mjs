import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('registry declares the approved stable widget types without persisted component names', async () => {
  const source=await readFile(new URL('../widgetRegistry.js',import.meta.url),'utf8')
  for(const type of ['text','image','twitch-chat','alerts','tts','goal','mission','sponsor','achievement','upcoming-event']) assert.match(source,new RegExp(`type: '${type}'`))
  assert.match(source,/component: TextWidget/);assert.doesNotMatch(source,/componentName/)
})
