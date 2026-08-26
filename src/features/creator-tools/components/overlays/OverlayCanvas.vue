<template>
  <div ref="viewport" class="canvas-viewport" :class="{ preview: previewMode }" @pointerdown.self="emit('select', '')" @dragstart.prevent>
    <div class="canvas-scaler" :style="{ width: `${overlay.resolution.width * scale}px`, height: `${overlay.resolution.height * scale}px` }">
      <div ref="canvas" class="overlay-canvas" :style="canvasStyle" @pointerdown.self="emit('select', '')">
        <div v-if="!previewMode && showGrid" class="canvas-grid"></div>
        <template v-if="!previewMode && showGuides">
          <div class="safe-guide webcam">Webcam safe area</div><div class="safe-guide chat">Chat safe area</div>
          <div class="safe-guide alerts">Alert safe area</div><div class="safe-guide action">Action safe zone</div>
        </template>
        <div v-for="guide in snapGuides" :key="`${guide.axis}-${guide.value}`" class="snap-guide" :class="guide.axis" :style="guide.axis === 'x' ? { left: `${guide.value}px` } : { top: `${guide.value}px` }"></div>
        <div
          v-for="widget in ordered" v-show="widget.enabled" :key="widget.id" class="widget-frame"
          :class="{ selected: widget.id === selectedId, locked: widget.locked, dragging: widget.id === draggingId, replaying: widget.id === activeWidgetId && !animationsPaused }"
          :data-instance-id="widget.id" :data-locked="widget.locked" :style="frameStyle(widget)"
          :tabindex="previewMode ? -1 : 0" :aria-label="`${widget.name}${widget.locked ? ', locked' : ''}`"
          @pointerdown.stop="startMove($event, widget)"
        >
          <component :is="registry[widget.type].component" class="widget-renderer" :widget="widget" />
          <template v-if="showsHandles(widget)">
            <span
              v-for="handle in resizeHandles" :key="handle" class="resize-handle" :class="handle"
              :data-resize-handle="handle" :aria-label="`Resize ${widget.name} ${handle}`" role="button"
              @pointerdown.stop="startResize($event, widget, handle)"
            ></span>
          </template>
          <span v-if="!previewMode && widget.locked" class="lock-badge">Locked</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { widgetRegistry as registry } from '../../widgets/registry/index.js'
import { canvasScalesFromBounds, clientDeltaToCanvas, DEFAULT_GRID_SIZE, editorScale, moveFrame, resizeFrameWithSnapping } from '../../overlays/overlayGeometry.js'
import { createWidgetSnapshot } from '../../overlays/overlaySnapshots.js'
import { themeVariables } from '../../overlays/overlayThemes.js'

const props = defineProps({ overlay: { type: Object, required: true }, selectedId: String, previewMode: Boolean, showPreviewBackground: Boolean, showGuides: Boolean, showGrid: { type: Boolean, default: true }, snapping: { type: Boolean, default: true }, activeWidgetId: String, animationsPaused: Boolean, zoomMode: { type: String, default: 'fit' } })
const emit = defineEmits(['select', 'change'])
const viewport = ref(null), canvas = ref(null), scale = ref(0.45), snapGuides = ref([]), draggingId = ref('')
const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
let observer, interaction = null
const ordered = computed(() => [...props.overlay.widgets].sort((a, b) => a.zIndex - b.zIndex))

function updateScale() {
  const bounds = viewport.value?.getBoundingClientRect()
  if (!bounds) return
  const numeric = Number(props.zoomMode)
  scale.value = props.zoomMode === 'actual' ? 1 : props.zoomMode === 'fit'
    ? editorScale(props.overlay.resolution.width, props.overlay.resolution.height, bounds.width, bounds.height, 24)
    : numeric > 0 ? numeric : 1
}
onMounted(async () => { await nextTick(); updateScale(); observer = new ResizeObserver(updateScale); observer.observe(viewport.value) })
watch(() => [props.zoomMode, props.overlay.resolution.width, props.overlay.resolution.height], updateScale)
onBeforeUnmount(() => { observer?.disconnect(); cancelInteraction() })

const background = computed(() => {
  if (['custom', 'game-draft'].includes(props.overlay.preview.backgroundType) && props.overlay.preview.customImageUrl) return `url(${props.overlay.preview.customImageUrl}) center/cover`
  if (props.overlay.preview.backgroundType === 'solid') return props.overlay.preview.color
  const id = props.overlay.preview.referenceAssetId
  if (id === 'blank') return '#111827'
  if (id === 'bright-gameplay') return 'linear-gradient(135deg,#a5c9b7,#4d7183 45%,#a77a4c)'
  if (id === 'camera' || id === 'studio') return 'radial-gradient(circle at 50% 35%,#425372,#161929 58%,#080b14)'
  if (id === 'minimal') return 'linear-gradient(135deg,#171923,#07090e)'
  return 'linear-gradient(145deg,#173b39,#101827 44%,#3b214b)'
})
const canvasStyle = computed(() => ({ width: `${props.overlay.resolution.width}px`, height: `${props.overlay.resolution.height}px`, transform: `scale(${scale.value})`, transformOrigin: 'top left', background: props.previewMode && !props.showPreviewBackground ? 'transparent' : background.value, '--editor-inverse-scale': 1 / Math.max(scale.value, 0.01) }))

function definition(widget) { return registry[widget.type] || { capabilities: { draggable: true, resizable: true }, minimumSize: { width: 80, height: 50 } } }
function frameCursor(widget) {
  if (props.previewMode) return 'default'
  if (widget.locked) return 'not-allowed'
  if (draggingId.value === widget.id) return interaction?.kind === 'resize' ? undefined : 'grabbing'
  return definition(widget).capabilities.draggable === false ? 'default' : 'grab'
}
function frameStyle(widget) { return { left: `${widget.frame.x}px`, top: `${widget.frame.y}px`, width: `${widget.frame.width}px`, height: `${widget.frame.height}px`, zIndex: widget.zIndex, cursor: frameCursor(widget), ...themeVariables(widget.themeId || props.overlay.themeId) } }
function showsHandles(widget) { return !props.previewMode && widget.id === props.selectedId && !widget.locked && definition(widget).capabilities.resizable !== false }

function begin(event, data) {
  if (event.isPrimary === false || event.button !== 0 || interaction) return
  const captureTarget = event.currentTarget, canvasBounds = canvas.value?.getBoundingClientRect()
  if (!captureTarget || !canvasBounds) return
  const scales = canvasScalesFromBounds(canvasBounds, props.overlay.resolution)
  if (!scales) return
  event.preventDefault()
  interaction = { ...data, pointerId: event.pointerId, captureTarget, scaleX: scales.x, scaleY: scales.y, startX: event.clientX, startY: event.clientY, changed: false }
  draggingId.value = data.widget.id
  addInteractionListeners()
  captureTarget.setPointerCapture?.(event.pointerId)
}
function startMove(event, widget) {
  emit('select', widget.id)
  if (props.previewMode || widget.locked || definition(widget).capabilities.draggable === false) return
  begin(event, { kind: 'move', widget: createWidgetSnapshot(widget) })
}
function startResize(event, widget, handle) {
  emit('select', widget.id)
  if (props.previewMode || widget.locked || definition(widget).capabilities.resizable === false) return
  begin(event, { kind: 'resize', handle, widget: createWidgetSnapshot(widget) })
}
function addInteractionListeners() {
  window.addEventListener('pointermove', onMove, { passive: false }); window.addEventListener('pointerup', endInteraction); window.addEventListener('pointercancel', cancelInteraction)
  interaction.captureTarget.addEventListener('lostpointercapture', lostPointerCapture)
}
function removeInteractionListeners(active) {
  window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', endInteraction); window.removeEventListener('pointercancel', cancelInteraction)
  active?.captureTarget?.removeEventListener('lostpointercapture', lostPointerCapture)
}
function onMove(event) {
  if (!interaction || event.pointerId !== interaction.pointerId) return
  event.preventDefault()
  const screenX = event.clientX - interaction.startX, screenY = event.clientY - interaction.startY
  if (!interaction.changed && Math.hypot(screenX, screenY) < 2) return
  interaction.changed = true
  const delta = clientDeltaToCanvas(screenX, screenY, interaction.scaleX, interaction.scaleY)
  const others = props.overlay.widgets.filter(widget => widget.id !== interaction.widget.id && widget.enabled).map(widget => widget.frame)
  const result = interaction.kind === 'move'
    ? moveFrame(interaction.widget.frame, delta, props.overlay.resolution, others, props.snapping, { gridSize: props.showGrid ? DEFAULT_GRID_SIZE : 0 })
    : resizeFrameWithSnapping(interaction.widget.frame, interaction.handle, delta, props.overlay.resolution, definition(interaction.widget).minimumSize, others, props.snapping)
  snapGuides.value = result.guides
  emit('change', { ...interaction.widget, frame: result.frame }, false)
}
function finishInteraction(commit) {
  if (!interaction) return
  const active = interaction, widget = props.overlay.widgets.find(item => item.id === active.widget.id)
  interaction = null
  removeInteractionListeners(active)
  if (commit && widget && active.changed) emit('change', createWidgetSnapshot(widget), true)
  if (active.captureTarget?.hasPointerCapture?.(active.pointerId)) active.captureTarget.releasePointerCapture(active.pointerId)
  draggingId.value = ''; snapGuides.value = []
}
function endInteraction(event) { if (interaction && event?.pointerId !== undefined && event.pointerId !== interaction.pointerId) return; finishInteraction(true) }
function cancelInteraction(event) { if (interaction && event?.pointerId !== undefined && event.pointerId !== interaction.pointerId) return; finishInteraction(Boolean(interaction?.changed)) }
function lostPointerCapture(event) { if (!interaction || event.pointerId !== interaction.pointerId) return; finishInteraction(Boolean(interaction.changed)) }
</script>
