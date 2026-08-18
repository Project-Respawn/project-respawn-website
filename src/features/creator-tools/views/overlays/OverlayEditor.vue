<template>
  <main class="universal-builder" :style="themeVars" @keydown.esc="closeTopLayer">
    <!-- OVERLAY SECTION 01: Top Application Header -->
    <OverlayBuilderToolbar data-overlay-section="01" data-overlay-section-name="header" :name="project.name" :theme-id="project.themeId" :themes="themes" :can-undo="history.canUndo" :can-redo="history.canRedo" :obs-status-label="obsStatusLabel" @rename="renameProject" @theme="changeTheme" @import="openHeaderPanel('import')" @export="openHeaderPanel('export')" @undo="undo" @redo="redo" @save="saveDemo" @preview="previewMode=true" @publish="openHeaderPanel('publish')" @settings="openObsConnection"/>
    <!-- OVERLAY SECTION 02: Demo Information Bar -->
    <div class="builder-demo-strip" data-overlay-section="02" data-overlay-section-name="demo-information-bar">{{ demoInformation }}</div>
    <p v-if="notice" class="builder-notice" role="status">{{ notice }} <button v-if="offerWidget" @click="toggleWidget(offerWidget,true)">Enable widget</button></p>
    <section class="overlay-workspace">
      <!-- OVERLAY SECTION 03: Widget Library -->
      <WidgetLibrary data-overlay-section="03" data-overlay-section-name="widget-library" :widgets="scene.widgets" :selected-id="project.selectedWidgetId" @toggle="toggleWidget" @select="selectWidget"/>
      <!-- OVERLAY SECTION 04: Main Overlay Canvas -->
      <section class="builder-panel canvas-panel" data-overlay-section="04" data-overlay-section-name="main-overlay-canvas"><header class="builder-panel__heading"><div><strong>{{ scene.name }}</strong><span> · {{ scene.resolution.width }} × {{ scene.resolution.height }}</span></div><label><span>▣</span><select aria-label="Aspect ratio"><option>16:9</option><option>4:3</option></select></label></header><OverlayCanvas :overlay="scene" :selected-id="project.selectedWidgetId" :zoom-mode="zoomMode" :show-guides="project.safeZone" :show-grid="project.grid" :snapping="project.snapping" :active-widget-id="activeWidgetId" :animations-paused="project.animationsPaused" @select="selectWidget" @change="changeWidget"/><footer class="canvas-footer"><button @click="setZoomMode('fit')">−</button><span>{{ zoomMode==='fit'?'Fit':'100%' }}</span><button @click="setZoomMode('actual')">＋</button><button @click="setZoomMode('fit')">Fit to screen</button><button @click="setZoomMode('actual')">Actual size</button><label><span>◉</span> Safe zone <select v-model="project.safeZone"><option :value="true">All</option><option :value="false">Off</option></select></label></footer></section>
      <!-- OVERLAY SECTION 05: Layers -->
      <WidgetLayersPanel data-overlay-section="05" data-overlay-section-name="layers" :widgets="scene.widgets" :selected-id="project.selectedWidgetId" @select="selectWidget" @action="layerAction"/>
      <!-- OVERLAY SECTION 06: Widget Settings -->
      <OverlayBuilderInspector data-overlay-section="06" data-overlay-section-name="widget-settings" :widget="selectedWidget" :suggestions="suggestions" :themes="themes" :theme-id="project.themeId" @change="changeWidget($event,true)" @move="moveSelectedChat" @suggestion="applyLocalSuggestion"/>
      <!-- OVERLAY SECTION 07: Recent Activity -->
      <RecentActivity data-overlay-section="07" data-overlay-section-name="recent-activity" :activities="activities" @replay="replay"/>
      <!-- OVERLAY SECTION 08: Overlay Scenes -->
      <OverlaySceneSelector data-overlay-section="08" data-overlay-section-name="overlay-scenes" :scenes="project.scenes" :selected-id="project.selectedSceneId" @select="selectScene" @action="sceneAction"/>
      <!-- OVERLAY SECTION 09: Game Preview -->
      <GamePreviewSelector data-overlay-section="09" data-overlay-section-name="game-preview" :preview="scene.preview" @change="changePreview" @upload="uploadPreview"/>
      <!-- OVERLAY SECTION 10: Browser Source Outputs -->
      <BrowserSourceOutputs data-overlay-section="10" data-overlay-section-name="browser-source-outputs" :resolution="scene.resolution" @copy="copyPlaceholder" @preview="openBrowserSourcePreview"/>
      <!-- OVERLAY SECTION 11: Test & Controls -->
      <OverlayTestControls data-overlay-section="11" data-overlay-section-name="test-controls" :paused="project.animationsPaused" :grid="project.grid" :snapping="project.snapping" :safe-zone="project.safeZone" :chat-selected="selectedWidget?.type==='twitch-chat'" :chat-locked="selectedWidget?.locked" @test="replay" @demo-chat-move="demoChatMove" @pause="setProject('animationsPaused',$event)" @grid="setProject('grid',$event)" @snapping="setProject('snapping',$event)" @safe-zone="setProject('safeZone',$event)" @undo="undo" @redo="redo" @reset-scene="resetScene" @reset-all="resetAll"/>
    </section>
    <div v-if="previewMode" class="builder-preview" role="dialog" aria-modal="true" aria-label="Overlay preview"><OverlayCanvas :overlay="scene" preview-mode show-preview-background :active-widget-id="activeWidgetId" :animations-paused="project.animationsPaused"/><div><button v-for="event in quickTests" :key="event.id" @click="replay(event)">{{ event.label }}</button><button class="exit" @click="previewMode=false">Exit Preview</button></div></div>
    <div v-if="activeHeaderPanel" class="builder-modal" role="dialog" aria-modal="true" :aria-label="`${activeHeaderPanel} overlay panel`" @click.self="closeHeaderPanel"><section tabindex="-1"><header><div><span>Frontend demonstration</span><h2>{{ headerPanelTitle }}</h2></div><button aria-label="Close" @click="closeHeaderPanel">×</button></header>
      <template v-if="activeHeaderPanel==='import'"><p>No OBS communication occurs. This safely previews a future setup scan.</p><button v-if="importStep==='intro'" class="modal-primary" @click="startObsScan">Scan example OBS setup</button><p v-else-if="importStep==='scanning'">Scanning the built-in demonstration…</p><template v-else-if="importStep==='review'"><label v-for="item in detectedObsSetup.scenes" :key="item.id"><input type="checkbox" :checked="item.selected" @change="toggleImportedScene(item.id)"> {{ item.name }}</label><button class="modal-primary" @click="confirmObsImport">Load selected example scenes</button></template><p v-else>Demo import complete. No OBS files or settings were changed.</p></template>
      <template v-else-if="activeHeaderPanel==='export'"><p>Prepare a frontend-only summary for {{ publishSummary.overlayName }}. No live browser source will be created.</p><ul><li>{{ publishSummary.scenes }} scenes</li><li>{{ publishSummary.widgets }} widgets in the current scene</li><li>{{ publishSummary.resolution }}</li></ul><button v-if="exportStep==='intro'" class="modal-primary" @click="beginObsExport">Review demo export</button><button v-else-if="exportStep==='review'" class="modal-primary" @click="confirmObsExport">Prepare demo export</button><p v-else>Demo export prepared. No OBS changes were made.</p></template>
      <template v-else-if="activeHeaderPanel==='publish'"><p>Publishing remains a frontend preview. No overlay URL or backend record will be created.</p><button v-if="publishStep==='intro'" class="modal-primary" @click="beginPublish">Review publish summary</button><template v-else-if="publishStep==='review'"><ul><li>{{ publishSummary.scenes }} overlay scenes</li><li>Current output {{ publishSummary.resolution }}</li></ul><button class="modal-primary" @click="confirmPublish">Mark ready for future publishing</button></template><p v-else>Ready for future publishing. Nothing is currently published.</p></template>
      <template v-else><p>{{ obsStatusLabel }}. The OBS plugin is not implemented in this demo.</p><button v-if="!obsConnection.connected" class="modal-primary" @click="simulateObsConnection">Simulate connection</button><button v-else class="modal-primary" @click="simulateObsDisconnect">Disconnect simulation</button></template>
    </section></div>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router'
import OverlayBuilderToolbar from '../../components/overlays/OverlayBuilderToolbar.vue'
import WidgetLibrary from '../../components/overlays/WidgetLibrary.vue'
import OverlayCanvas from '../../components/overlays/OverlayCanvas.vue'
import WidgetLayersPanel from '../../components/overlays/WidgetLayersPanel.vue'
import OverlayBuilderInspector from '../../components/overlays/OverlayBuilderInspector.vue'
import RecentActivity from '../../components/overlays/RecentActivity.vue'
import OverlaySceneSelector from '../../components/overlays/OverlaySceneSelector.vue'
import GamePreviewSelector from '../../components/overlays/GamePreviewSelector.vue'
import BrowserSourceOutputs from '../../components/overlays/BrowserSourceOutputs.vue'
import OverlayTestControls from '../../components/overlays/OverlayTestControls.vue'
import { useOverlayEditorCore, useOverlayHeader, useDemoInformationBar, useWidgetLibrary, useMainCanvas, useLayers, useWidgetSettings, useRecentActivity, useOverlayScenes, useGamePreview, useBrowserSources, useTestControls } from './logic/index.js'

const route = useRoute()
const core = useOverlayEditorCore(route)
const { project, history, notice, offerWidget, activeWidgetId, previewMode, scene, selectedWidget, commit, selectWidget, changeWidget, saveDemo } = core
const { demoInformation } = useDemoInformationBar()
const { toggleWidget } = useWidgetLibrary({ project, scene, commit, selectWidget })
const { zoomMode, setZoomMode } = useMainCanvas({ selectWidget, changeWidget })
const { layerAction } = useLayers({ scene, commit, selectWidget })
const settings = useWidgetSettings({ project, scene, selectedWidget, commit, selectWidget, changeWidget })
const { suggestions, moveSelectedChat, applyLocalSuggestion } = settings
const { activities, replay } = useRecentActivity({ ...core, project, scene, notice, offerWidget, activeWidgetId, selectWidget })
const { selectScene, sceneAction } = useOverlayScenes({ project, scene, notice, commit })
const { changePreview, uploadPreview } = useGamePreview({ scene, notice, commit, registerCleanup: core.registerCleanup })
const { copyPlaceholder, openBrowserSourcePreview } = useBrowserSources({ notice, previewMode })
const header = useOverlayHeader({ project, scene, commit, notice, saveDemo, focusSettings: settings.focusSettings })
const { activeHeaderPanel, headerPanelTitle, importStep, exportStep, publishStep, obsConnection, obsStatusLabel, detectedObsSetup, publishSummary, themes, themeVars, renameProject, changeTheme, openHeaderPanel, closeHeaderPanel, startObsScan, toggleImportedScene, confirmObsImport, beginObsExport, confirmObsExport, beginPublish, confirmPublish, openObsConnection, simulateObsConnection, simulateObsDisconnect } = header
const controls = useTestControls({ ...core, project, history, scene, selectedWidget, notice, previewMode, changeWidget, toggleWidget, replay, commit, closeHeaderPanel, activeHeaderPanel })
const { quickTests, setProject, demoChatMove, undo, redo, resetScene, resetAll, closeTopLayer } = controls
</script>

<style src="./OverlayEditor.css"></style><style src="../../widgets/widgets.css"></style>
