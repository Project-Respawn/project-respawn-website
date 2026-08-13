import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasScalesFromBounds, chatShowcaseTarget, clientDeltaToCanvas, editorScale, moveFrame, resizeFrame, scaleLayout } from '../overlayGeometry.js'

test('canvas uses stable native coordinates at visual scale', () => {
  assert.equal(editorScale(1920, 1080, 960, 700), .5)
  assert.deepEqual(clientDeltaToCanvas(50, 25, .5), { x: 100, y: 50 })
})
test('rendered canvas bounds produce independent drag scales', () => {
  const scales = canvasScalesFromBounds({ width: 960, height: 432 }, { width: 1920, height: 1080 })
  assert.deepEqual(scales, { x: .5, y: .4 })
  assert.deepEqual(clientDeltaToCanvas(50, 40, scales.x, scales.y), { x: 100, y: 100 })
  assert.equal(canvasScalesFromBounds({ width: 0, height: 400 }, { width: 1920, height: 1080 }), null)
})
test('chat showcase target moves to the opposite safe side without changing size', () => {
  const bounds = { width: 1920, height: 1080 }
  const right = chatShowcaseTarget({ x: 70, y: 120, width: 430, height: 620 }, bounds)
  assert.deepEqual(right, { x: 1420, y: 120, width: 430, height: 620 })
  const left = chatShowcaseTarget(right, bounds)
  assert.deepEqual(left, { x: 70, y: 120, width: 430, height: 620 })
})
test('movement clamps and snaps to canvas edges', () => {
  const result = moveFrame({ x: 8, y: 7, width: 100, height: 50 }, { x: -2, y: -1 }, { width: 500, height: 300 })
  assert.equal(result.frame.x, 0); assert.equal(result.frame.y, 0); assert.equal(result.guides.length, 2)
})
test('resize respects minimum and canvas bounds', () => {
  assert.deepEqual(resizeFrame({ x: 10, y: 10, width: 100, height: 100 }, 'nw', { x: 90, y: 90 }, { width: 500, height: 300 }), { x: 30, y: 60, width: 80, height: 50 })
})
test('resolution scaling preserves proportional geometry', () => {
  const [widget] = scaleLayout([{ frame: { x: 100, y: 50, width: 400, height: 200 } }], { width: 1920, height: 1080 }, { width: 3840, height: 2160 })
  assert.deepEqual(widget.frame, { x: 200, y: 100, width: 800, height: 400 })
})
