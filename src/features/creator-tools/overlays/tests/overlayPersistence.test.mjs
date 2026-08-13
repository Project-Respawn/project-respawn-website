import test from 'node:test'
import assert from 'node:assert/strict'
import { OVERLAY_STORAGE_KEY } from '../overlayModel.js'
import { loadOverlayState, saveOverlayState } from '../overlayPersistence.js'

function memoryStorage(value) { return { value, getItem(){return this.value}, setItem(_key,next){this.value=next} } }
test('versioned state round trips without session image URLs', () => {
  const storage=memoryStorage(); const state={schemaVersion:1,overlays:[{preview:{customImageUrl:'blob:secret',backgroundType:'custom'}}]}
  saveOverlayState(storage,state); assert.equal(storage.value.includes('blob:secret'),false); assert.equal(loadOverlayState(storage,{}).recovered,false)
})
test('malformed and old storage safely recover', () => {
  const fallback={schemaVersion:1,overlays:[]}
  assert.equal(loadOverlayState(memoryStorage('{broken'),fallback).recovered,true)
  assert.equal(loadOverlayState(memoryStorage(JSON.stringify({schemaVersion:0,overlays:[]})),fallback).recovered,true)
  assert.equal(OVERLAY_STORAGE_KEY.includes('v1'),true)
})
test('missing storage uses starter state without presenting a migration', () => {
  const fallback={schemaVersion:1,overlays:[{id:'main',name:'Main Gameplay'}]}
  const loaded=loadOverlayState(memoryStorage(undefined),fallback)
  assert.equal(loaded.recovered,false)
  assert.deepEqual(loaded.state,fallback)
})
