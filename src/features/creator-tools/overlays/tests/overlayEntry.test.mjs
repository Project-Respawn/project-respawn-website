import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseEntryOverlayId } from '../overlayEntryRouting.js'

const overlays=[{id:'main',name:'Main Gameplay'},{id:'chat',name:'Just Chatting'}]
test('overlay entry prefers the remembered project',()=>assert.equal(chooseEntryOverlayId(overlays,'chat'),'chat'))
test('overlay entry defaults to Main Gameplay when no recent project exists',()=>assert.equal(chooseEntryOverlayId(overlays,null),'main'))
test('overlay entry ignores a removed remembered project',()=>assert.equal(chooseEntryOverlayId(overlays,'missing'),'main'))
