import test from 'node:test'
import assert from 'node:assert/strict'
import { createOverlay, runtimeSafeOverlay } from '../overlayModel.js'

test('runtime serialization excludes editor backgrounds and credentials', () => {
  const overlay=createOverlay();overlay.preview.customImageUrl='blob:local';overlay.widgets=[{id:'w',editorState:{selected:true},settings:{text:'safe'}}]
  const safe=runtimeSafeOverlay(overlay);const serialized=JSON.stringify(safe)
  assert.equal('preview' in safe,false);assert.equal(serialized.includes('blob:local'),false);assert.equal(serialized.includes('broadcasterId'),false);assert.equal(serialized.includes('credential'),false);assert.equal('editorState' in safe.widgets[0],false)
})
