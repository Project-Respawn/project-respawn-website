import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasScalesFromBounds, chatShowcaseTarget, clientDeltaToCanvas, editorScale, moveFrame, resizeFrame, resizeFrameWithSnapping, scaleLayout } from '../overlayGeometry.js'

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
test('movement snaps centres and reports the actual canvas guide coordinate', () => {
  const result = moveFrame({ x: 440, y: 240, width: 100, height: 100 }, { x: 8, y: 7 }, { width: 1000, height: 600 })
  assert.deepEqual(result.frame, { x: 450, y: 250, width: 100, height: 100 })
  assert.deepEqual(result.guides, [{ axis: 'x', value: 500 }, { axis: 'y', value: 300 }])
})
test('movement snaps edges and centres to other widget alignment lines', () => {
  const other = { x: 300, y: 200, width: 200, height: 100 }
  const left = moveFrame({ x: 292, y: 20, width: 100, height: 50 }, { x: 0, y: 0 }, { width: 1000, height: 600 }, [other])
  assert.equal(left.frame.x, 300)
  assert.deepEqual(left.guides.find(guide => guide.axis === 'x'), { axis: 'x', value: 300 })
  const centre = moveFrame({ x: 344, y: 20, width: 100, height: 50 }, { x: 0, y: 0 }, { width: 1000, height: 600 }, [other])
  assert.equal(centre.frame.x, 350)
  assert.deepEqual(centre.guides.find(guide => guide.axis === 'x'), { axis: 'x', value: 400 })
})
test('resize respects minimum and canvas bounds', () => {
  assert.deepEqual(resizeFrame({ x: 10, y: 10, width: 100, height: 100 }, 'nw', { x: 90, y: 90 }, { width: 500, height: 300 }), { x: 30, y: 60, width: 80, height: 50 })
})
test('all eight resize handles change the expected axes', () => {
  const frame = { x: 100, y: 100, width: 200, height: 100 }
  const bounds = { width: 1000, height: 600 }
  const expected = {
    nw: [110, 110, 190, 90], n: [100, 110, 200, 90], ne: [100, 110, 210, 90], e: [100, 100, 210, 100],
    se: [100, 100, 210, 110], s: [100, 100, 200, 110], sw: [110, 100, 190, 110], w: [110, 100, 190, 100],
  }
  for (const [handle, values] of Object.entries(expected)) {
    const result = resizeFrame(frame, handle, { x: 10, y: 10 }, bounds)
    assert.deepEqual([result.x, result.y, result.width, result.height], values, handle)
  }
})
test('widget minimum size is respected from anchored sides', () => {
  assert.deepEqual(resizeFrame({ x: 100, y: 100, width: 200, height: 100 }, 'nw', { x: 150, y: 90 }, { width: 500, height: 300 }, { width: 120, height: 80 }), { x: 180, y: 120, width: 120, height: 80 })
})
test('resized edges snap to other widgets and report the alignment coordinate', () => {
  const result = resizeFrameWithSnapping({ x: 100, y: 100, width: 190, height: 100 }, 'e', { x: 4, y: 0 }, { width: 1000, height: 600 }, { width: 80, height: 50 }, [{ x: 300, y: 50, width: 100, height: 100 }])
  assert.equal(result.frame.width, 200)
  assert.deepEqual(result.guides, [{ axis: 'x', value: 300 }])
})
test('resolution scaling preserves proportional geometry', () => {
  const [widget] = scaleLayout([{ frame: { x: 100, y: 50, width: 400, height: 200 } }], { width: 1920, height: 1080 }, { width: 3840, height: 2160 })
  assert.deepEqual(widget.frame, { x: 200, y: 100, width: 800, height: 400 })
})
