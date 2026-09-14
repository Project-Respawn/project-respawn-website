import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../../components/overlays/OverlayCanvas.vue', import.meta.url), 'utf8')
const styles = await readFile(new URL('../../views/overlays/OverlayEditor.css', import.meta.url), 'utf8')

test('canvas renders eight explicit resize handles only for editable selections', () => {
  assert.match(source, /\['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'\]/)
  assert.match(source, /v-for="handle in resizeHandles"/)
  assert.match(source, /widget\.id === props\.selectedId && !widget\.locked/)
  assert.match(source, /@pointerdown\.stop="startResize\(\$event, widget, handle\)"/)
})

test('canvas owns rendered widget pointer interaction and supports empty-space deselection', () => {
  assert.match(source, /class="widget-renderer"/)
  assert.match(source, /@pointerdown\.stop="startMove\(\$event, widget\)"/)
  assert.match(source, /class="overlay-canvas"[^>]+@pointerdown\.self="emit\('select', ''\)"/)
})

test('widget selection chrome is positioned by its individual frame, not normal canvas flow', () => {
  assert.match(source, /class="widget-frame"/)
  assert.match(source, /left: `\$\{widget\.frame\.x\}px`/)
  assert.match(source, /top: `\$\{widget\.frame\.y\}px`/)
  assert.match(source, /width: `\$\{widget\.frame\.width\}px`/)
  assert.match(source, /height: `\$\{widget\.frame\.height\}px`/)
  assert.match(styles, /\.canvas-panel \.canvas-scaler \{[\s\S]*?position:\s*relative;/)
  assert.match(styles, /\.canvas-panel \.overlay-canvas \{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;/)
  assert.match(styles, /\.widget-frame \{[\s\S]*?position:\s*absolute;[\s\S]*?box-sizing:\s*border-box;/)
})

test('pointer lifecycle captures, commits once, and cleans up cancellation and lost capture', () => {
  assert.match(source, /setPointerCapture/)
  assert.match(source, /window\.addEventListener\('pointermove'/)
  assert.match(source, /lostpointercapture/)
  assert.match(source, /emit\('change', \{ \.\.\.interaction\.widget, frame: result\.frame \}, false\)/)
  assert.match(source, /active\.changed\) emit\('change', createWidgetSnapshot\(widget\), true\)/)
  assert.match(source, /onBeforeUnmount\(\(\) => \{ observer\?\.disconnect\(\); cancelInteraction\(\) \}\)/)
})
