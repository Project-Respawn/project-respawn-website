import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createBuilderProject } from '../overlayBuilderDemoState.js'
import { chatShowcaseTarget, moveFrame } from '../overlayGeometry.js'
import { createHistory } from '../overlayHistory.js'

test('Unified Chat movement updates X/Y and remains one undoable transaction', () => {
  const project = createBuilderProject()
  const scene = project.scenes.find(item => item.id === 'scene-main-gameplay')
  const chat = scene.widgets.find(item => item.type === 'twitch-chat')
  const start = { ...chat.frame }
  const history = createHistory(project)
  chat.frame = moveFrame(chat.frame, { x: -600, y: 120 }, scene.resolution, [], false).frame
  history.commit(project)
  assert.notEqual(chat.frame.x, start.x)
  assert.notEqual(chat.frame.y, start.y)
  assert.deepEqual(history.undo().scenes.find(item => item.id === scene.id).widgets.find(item => item.id === chat.id).frame, start)
  assert.deepEqual(history.redo().scenes.find(item => item.id === scene.id).widgets.find(item => item.id === chat.id).frame, chat.frame)
})

test('Demo Chat Move chooses the opposite safe side at Fit-scale-independent geometry', () => {
  const scene = createBuilderProject().scenes.find(item => item.id === 'scene-main-gameplay')
  const chat = scene.widgets.find(item => item.type === 'twitch-chat')
  const target = chatShowcaseTarget(chat.frame, scene.resolution)
  assert.equal(target.x, 70)
  assert.equal(target.y, chat.frame.y)
})

test('canvas exposes universal dragging, eight resize handles, and locked fallbacks', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const canvas = readFileSync(`${root}components/overlays/OverlayCanvas.vue`, 'utf8')
  const inspector = readFileSync(`${root}components/overlays/OverlayBuilderInspector.vue`, 'utf8')
  const controls = readFileSync(`${root}components/overlays/OverlayTestControls.vue`, 'utf8')
  assert.doesNotMatch(canvas, /chat-drag-handle|Drag Chat/)
  assert.match(canvas, /@pointerdown\.stop\.prevent="startMove\(\$event,widget\)"/)
  assert.match(canvas, /handles=\['nw','n','ne','e','se','s','sw','w'\]/)
  assert.match(canvas, /w\.locked\|\|definition\(w\)\.capabilities\.draggable===false/)
  assert.match(canvas, /!w\.locked&&definition\(w\)\.capabilities\.resizable!==false/)
  for (const label of ['Move Left', 'Move Right', 'Move Up', 'Move Down', 'Move chat to left', 'Move chat to right']) assert.match(inspector, new RegExp(label))
  assert.match(controls, /Demo Chat Move/)
  assert.match(controls, /browser only/)
})
