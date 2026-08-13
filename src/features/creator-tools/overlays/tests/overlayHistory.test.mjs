import test from 'node:test'
import assert from 'node:assert/strict'
import { createHistory } from '../overlayHistory.js'

test('history supports undo, redo, branching and a cap', () => {
  const history=createHistory({value:0},2); history.commit({value:1}); history.commit({value:2}); history.commit({value:3})
  assert.equal(history.undo().value,2); assert.equal(history.undo().value,1); assert.equal(history.undo().value,1)
  assert.equal(history.redo().value,2); history.commit({value:8}); assert.equal(history.canRedo,false)
})
