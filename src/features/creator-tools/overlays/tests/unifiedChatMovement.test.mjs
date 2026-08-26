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

test('canvas separates body movement from explicit resize handles with capability and locked fallbacks', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const canvas = readFileSync(`${root}components/overlays/OverlayCanvas.vue`, 'utf8')
  const controls = readFileSync(`${root}components/overlays/OverlayTestControls.vue`, 'utf8')
  assert.doesNotMatch(canvas, /chat-drag-handle|Drag Chat/)
  assert.match(canvas, /@pointerdown\.stop="startMove\(\$event, widget\)"/)
  assert.match(canvas, /class="resize-handle"/)
  assert.match(canvas, /@pointerdown\.stop="startResize\(\$event, widget, handle\)"/)
  assert.match(canvas, /widget\.locked \|\| definition\(widget\)\.capabilities\.draggable === false/)
  assert.match(canvas, /widget\.locked \|\| definition\(widget\)\.capabilities\.resizable === false/)
  assert.match(controls, /Demo Chat Move/)
  assert.match(controls, /browser only/)
})

test('canvas interaction CSS has eight-handle controls and keeps a non-interactive frame-filling renderer', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const css = readFileSync(`${root}views/overlays/OverlayEditor.css`, 'utf8')
  assert.match(css, /\.widget-frame\s*> \.widget-renderer[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;/)
  assert.match(css, /\.resize-handle/)
  assert.match(css, /pointer-events:\s*none;/)
  assert.doesNotMatch(css, /chat-drag-handle/)
})

test('explicit resize handles use pointer capture and standard cursors', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const canvas = readFileSync(`${root}components/overlays/OverlayCanvas.vue`, 'utf8')
  const css = readFileSync(`${root}views/overlays/OverlayEditor.css`, 'utf8')
  assert.match(canvas, /captureTarget = event\.currentTarget/)
  assert.match(canvas, /setPointerCapture/)
  for (const cursor of ['ns-resize', 'ew-resize', 'nwse-resize', 'nesw-resize']) assert.match(css, new RegExp(cursor))
  assert.match(canvas, /grabbing/)
})
