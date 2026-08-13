import test from 'node:test'
import assert from 'node:assert/strict'
import { deleteFromState, duplicateInState, renameInState } from '../overlayOperations.js'

test('overlay operations rename, duplicate and protect the final layout', () => {
  const state = { overlays: [{ id: 'one', name: 'One', version: 1, widgets: [{ id: 'w1' }] }] }
  assert.equal(renameInState(state, 'one', 'Main', 'now'), true); assert.equal(state.overlays[0].version, 2)
  const copy = duplicateInState(state, 'one', 'two', 'later'); assert.equal(copy.name, 'Main Copy'); assert.notEqual(copy.widgets[0].id, 'w1')
  assert.equal(deleteFromState(state, 'one'), true); assert.equal(deleteFromState(state, 'two'), false)
})
