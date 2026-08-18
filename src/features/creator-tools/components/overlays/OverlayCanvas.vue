<template>
  <div ref="viewport" class="canvas-viewport" :class="{preview:previewMode}" @pointerdown.self="$emit('select','')" @dragstart.prevent>
    <div class="canvas-scaler" :style="{width:`${overlay.resolution.width*scale}px`,height:`${overlay.resolution.height*scale}px`}">
      <div ref="canvas" class="overlay-canvas" :style="canvasStyle">
        <div v-if="!previewMode&&showGrid" class="canvas-grid"></div>
        <template v-if="!previewMode&&showGuides"><div class="safe-guide webcam">Webcam safe area</div><div class="safe-guide chat">Chat safe area</div><div class="safe-guide alerts">Alert safe area</div><div class="safe-guide action">Action safe zone</div></template>
        <div v-for="guide in snapGuides" :key="`${guide.axis}-${guide.value}`" class="snap-guide" :class="guide.axis" :style="guide.axis==='x'?{left:`${guide.value}px`}:{top:`${guide.value}px`}"></div>
        <div v-for="widget in ordered" v-show="widget.enabled" :key="widget.id" class="widget-frame" :class="{selected:widget.id===selectedId,locked:widget.locked,dragging:widget.id===draggingId,replaying:widget.id===activeWidgetId&&!animationsPaused}" :data-instance-id="widget.id" :data-locked="widget.locked" :style="frameStyle(widget)" :tabindex="previewMode?-1:0" :aria-label="`${widget.name}${widget.locked?', locked':''}`" @pointerdown.stop.prevent="startMove($event,widget)" @click.stop="$emit('select',widget.id)" @keydown="nudge($event,widget)">
          <component :is="registry[widget.type].component" class="widget-renderer" :widget="widget"/>
          <template v-if="canResize(widget)"><button v-for="handle in handles" :key="handle" type="button" tabindex="-1" class="resize-handle" :class="handle" :aria-label="`Resize ${widget.name} from ${handle}`" @pointerdown.stop.prevent="startResize($event,widget,handle)"></button></template>
          <span v-if="!previewMode&&widget.locked" class="lock-badge">Locked</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import{computed,nextTick,onBeforeUnmount,onMounted,ref,watch}from'vue'
import{widgetRegistry as registry}from'../../widgets/registry/index.js'
import{canvasScalesFromBounds,clientDeltaToCanvas,DEFAULT_GRID_SIZE,editorScale,moveFrame,resizeFrameWithSnapping}from'../../overlays/overlayGeometry.js'
import{createWidgetSnapshot}from'../../overlays/overlaySnapshots.js'
import{themeVariables}from'../../overlays/overlayThemes.js'
const props=defineProps({overlay:{type:Object,required:true},selectedId:String,previewMode:Boolean,showPreviewBackground:Boolean,showGuides:Boolean,showGrid:{type:Boolean,default:true},snapping:{type:Boolean,default:true},activeWidgetId:String,animationsPaused:Boolean,zoomMode:{type:String,default:'fit'}})
const emit=defineEmits(['select','change']),viewport=ref(null),canvas=ref(null),scale=ref(.45),snapGuides=ref([]),draggingId=ref(''),handles=['nw','n','ne','e','se','s','sw','w'];let observer,interaction=null
const ordered=computed(()=>[...props.overlay.widgets].sort((a,b)=>a.zIndex-b.zIndex))
function updateScale(){const b=viewport.value?.getBoundingClientRect();if(!b)return;const numeric=Number(props.zoomMode);scale.value=props.zoomMode==='actual'?1:props.zoomMode==='fit'?editorScale(props.overlay.resolution.width,props.overlay.resolution.height,b.width,b.height,24):numeric>0?numeric:1}
onMounted(async()=>{await nextTick();updateScale();observer=new ResizeObserver(updateScale);observer.observe(viewport.value)})
watch(()=>props.zoomMode,updateScale)
onBeforeUnmount(()=>{observer?.disconnect();cancelInteraction()})
const background=computed(()=>{if(['custom','game-draft'].includes(props.overlay.preview.backgroundType)&&props.overlay.preview.customImageUrl)return`url(${props.overlay.preview.customImageUrl}) center/cover`;if(props.overlay.preview.backgroundType==='solid')return props.overlay.preview.color;const id=props.overlay.preview.referenceAssetId;if(id==='blank')return'#111827';if(id==='bright-gameplay')return'linear-gradient(135deg,#a5c9b7,#4d7183 45%,#a77a4c)';if(id==='camera'||id==='studio')return'radial-gradient(circle at 50% 35%,#425372,#161929 58%,#080b14)';if(id==='minimal')return'linear-gradient(135deg,#171923,#07090e)';return'linear-gradient(145deg,#173b39,#101827 44%,#3b214b)'})
const canvasStyle=computed(()=>({width:`${props.overlay.resolution.width}px`,height:`${props.overlay.resolution.height}px`,transform:`scale(${scale.value})`,transformOrigin:'top left',background:props.previewMode&&!props.showPreviewBackground?'transparent':background.value}))
function frameStyle(w){return{left:`${w.frame.x}px`,top:`${w.frame.y}px`,width:`${w.frame.width}px`,height:`${w.frame.height}px`,zIndex:w.zIndex,...themeVariables(w.themeId||props.overlay.themeId)}}
function definition(w){return registry[w.type]||{capabilities:{draggable:true,resizable:true},minimumSize:{width:80,height:50}}}
function canResize(w){return!props.previewMode&&w.id===props.selectedId&&!w.locked&&definition(w).capabilities.resizable!==false}
function begin(e,data){if(e.isPrimary===false||e.button!==0||interaction)return;const captureTarget=canvas.value,bounds=captureTarget?.getBoundingClientRect();if(!captureTarget||!bounds)return;const scales=canvasScalesFromBounds(bounds,props.overlay.resolution);if(!scales)return;e.preventDefault();captureTarget.setPointerCapture?.(e.pointerId);interaction={...data,pointerId:e.pointerId,captureTarget,bounds:{left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height},scaleX:scales.x,scaleY:scales.y,startX:e.clientX,startY:e.clientY,changed:false};draggingId.value=data.widget.id;add()}
function startMove(e,w){emit('select',w.id);if(props.previewMode||w.locked||definition(w).capabilities.draggable===false)return;begin(e,{kind:'move',widget:createWidgetSnapshot(w)})}
function startResize(e,w,handle){if(!canResize(w))return;begin(e,{kind:'resize',handle,widget:createWidgetSnapshot(w)})}
function add(){window.addEventListener('pointermove',onMove,{passive:false});window.addEventListener('pointerup',end);window.addEventListener('pointercancel',cancelInteraction)}
function remove(){window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',cancelInteraction)}
function onMove(e){if(!interaction||e.pointerId!==interaction.pointerId)return;e.preventDefault();const dx=e.clientX-interaction.startX,dy=e.clientY-interaction.startY;if(!interaction.changed&&Math.hypot(dx,dy)<2)return;interaction.changed=true;const d=clientDeltaToCanvas(dx,dy,interaction.scaleX,interaction.scaleY),others=props.overlay.widgets.filter(w=>w.id!==interaction.widget.id&&w.enabled).map(w=>w.frame);let result;if(interaction.kind==='move')result=moveFrame(interaction.widget.frame,d,props.overlay.resolution,others,props.snapping,{gridSize:props.showGrid?DEFAULT_GRID_SIZE:0});else result=resizeFrameWithSnapping(interaction.widget.frame,interaction.handle,d,props.overlay.resolution,definition(interaction.widget).minimumSize,others,props.snapping);snapGuides.value=result.guides;emit('change',{...interaction.widget,frame:result.frame},false)}
function finishInteraction(commit){if(!interaction)return;const active=interaction,w=props.overlay.widgets.find(x=>x.id===active.widget.id);if(commit&&w&&active.changed)emit('change',createWidgetSnapshot(w),true);if(active.captureTarget?.hasPointerCapture?.(active.pointerId))active.captureTarget.releasePointerCapture(active.pointerId);interaction=null;draggingId.value='';snapGuides.value=[];remove()}
function end(e){if(interaction&&e?.pointerId!==undefined&&e.pointerId!==interaction.pointerId)return;finishInteraction(true)}
function cancelInteraction(e){if(interaction&&e?.pointerId!==undefined&&e.pointerId!==interaction.pointerId)return;finishInteraction(Boolean(interaction?.changed))}
function nudge(e,w){if(props.previewMode||w.locked||definition(w).capabilities.draggable===false||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const n=e.shiftKey?10:1,d={x:e.key==='ArrowLeft'?-n:e.key==='ArrowRight'?n:0,y:e.key==='ArrowUp'?-n:e.key==='ArrowDown'?n:0};emit('change',{...w,frame:moveFrame(w.frame,d,props.overlay.resolution,[],false).frame},true)}
</script>
