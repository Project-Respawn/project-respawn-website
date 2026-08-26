import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { createHistory } from '../overlayHistory.js'
import { createOverlaySnapshot } from '../overlaySnapshots.js'

test('history supports undo, redo, branching and a cap', () => {
  const history=createHistory({value:0},2); history.commit({value:1}); history.commit({value:2}); history.commit({value:3})
  assert.equal(history.undo().value,2); assert.equal(history.undo().value,1); assert.equal(history.undo().value,1)
  assert.equal(history.redo().value,2); history.commit({value:8}); assert.equal(history.canRedo,false)
})

test('history snapshots Vue reactive editor state without cloning the Proxy', () => {
  const project=reactive({schemaVersion:1,name:'Demo',themeId:'respawn-purple',selectedSceneId:'main',selectedWidgetId:'',grid:true,snapping:true,safeZone:true,animationsPaused:false,publishReady:false,obsMappings:[],scenes:[{schemaVersion:1,id:'main',name:'Main Gameplay',description:'',resolution:{width:1920,height:1080},runtime:{status:'demo'},version:1,required:true,isDefault:true,themeId:'respawn-purple',preview:{referenceAssetId:'dark'},widgets:[]}]})
  assert.throws(()=>structuredClone(project),/clone/i)
  const history=createHistory(project,40,createOverlaySnapshot)
  project.name='Changed';history.commit(project)
  assert.equal(history.undo().name,'Demo')
  assert.equal(history.redo().name,'Changed')
})

test('overlay snapshots exclude runtime callbacks and retain editable data', () => {
  const project={schemaVersion:1,name:'Demo',themeId:'respawn-purple',selectedSceneId:'main',selectedWidgetId:'widget',grid:true,snapping:true,safeZone:true,animationsPaused:false,publishReady:false,obsMappings:[],runtimeCallback(){},scenes:[{id:'main',name:'Main',widgets:[{id:'widget',type:'alerts',name:'Alert',enabled:true,locked:false,frame:{x:1,y:2,width:3,height:4},zIndex:1,settings:{message:'Hi',callback(){}}}]}]}
  const snapshot=createOverlaySnapshot(project)
  assert.equal('runtimeCallback' in snapshot,false)
  assert.deepEqual(snapshot.scenes[0].widgets[0].settings,{message:'Hi'})
})

test('a transient canvas interaction creates exactly one history entry when committed', () => {
  const original = { widgets: [{ id: 'one', frame: { x: 10, y: 20, width: 100, height: 80 } }] }
  const project = structuredClone(original)
  const history = createHistory(project)
  project.widgets[0].frame = { x: 30, y: 40, width: 140, height: 110 }
  history.commit(project)
  assert.deepEqual(history.undo(), original)
  assert.deepEqual(history.undo(), original, 'a second undo proves pointer moves did not create extra entries')
  assert.deepEqual(history.redo(), project)
})
