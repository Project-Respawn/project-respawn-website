<template>
  <main
    class="universal-builder"
    :style="themeVars"
    @keydown.esc="closeTopLayer"
  >

    <!-- ======================================================
         OVERLAY SECTION 01
         TOP APPLICATION HEADER
         ====================================================== -->

    <OverlayBuilderToolbar
      data-overlay-section="01"
      data-overlay-section-name="header"
      :name="project.name"
      :theme-id="project.themeId"
      :themes="themes"
      :can-undo="history.canUndo"
      :can-redo="history.canRedo"
      :loading="loading"
      :saving="saving"
      :dirty="dirty"
      :revision="revision"
      :obs-status-label="obsStatusLabel"
      @rename="renameProject"
      @theme="changeTheme"
      @import="openHeaderPanel('import')"
      @export="openHeaderPanel('export')"
      @undo="undo"
      @redo="redo"
      @save="saveDemo"
      @preview="previewMode = true"
      @publish="openHeaderPanel('publish')"
      @settings="openObsConnection"
    />


    <!-- ======================================================
         OVERLAY SECTION 02
         DEMO INFORMATION BAR
         ====================================================== -->

    <div
      class="builder-demo-strip"
      data-overlay-section="02"
      data-overlay-section-name="demo-information-bar"
    >
      {{ demoInformation }}
    </div>

    <p
      v-if="notice"
      class="builder-notice"
      role="status"
    >
      {{ notice }}

      <button
        v-if="offerWidget"
        type="button"
        @click="toggleWidget(offerWidget, true)"
      >
        Enable widget
      </button>
    </p>


    <!-- ======================================================
         OVERLAY MAIN WORKSPACE

         COLUMN 01 = Widget Library
         COLUMN 02 = Main Canvas
         COLUMN 03 = Layers / Widget Settings
         COLUMN 04 = Recent Activity
         ====================================================== -->

    <section class="overlay-workspace">


      <!-- ====================================================
           OVERLAY SECTION 03
           WIDGET LIBRARY
           ==================================================== -->

      <div class="workspace-zone workspace-zone--library">
        <WidgetLibrary
          data-overlay-section="03"
          data-overlay-section-name="widget-library"
          :widgets="scene.widgets"
          :selected-id="project.selectedWidgetId"
          @toggle="toggleWidget"
          @select="selectWidget"
        />
      </div>


      <!-- ====================================================
           OVERLAY SECTION 04
           MAIN OVERLAY CANVAS
           ==================================================== -->

      <section
        class="
          builder-panel
          canvas-panel
          workspace-zone
          workspace-zone--canvas
        "
        data-overlay-section="04"
        data-overlay-section-name="main-overlay-canvas"
      >

        <!-- Section 04A: Canvas Header -->

        <header class="builder-panel__heading">
          <div>
            <strong>{{ scene.name }}</strong>

            <span>
              ·
              {{ scene.resolution.width }}
              ×
              {{ scene.resolution.height }}
            </span>
          </div>

          <label>
            <span>▣</span>

            <select aria-label="Aspect ratio">
              <option>16:9</option>
              <option>4:3</option>
            </select>
          </label>
        </header>


<!-- ========================================================
     SECTION 04B
     INTERACTIVE CANVAS
     ======================================================== -->

<OverlayCanvas
  :overlay="scene"
  :selected-id="project.selectedWidgetId"
  :zoom-mode="zoomMode"
  :show-guides="project.safeZone"
  :show-grid="project.grid"
  :snapping="project.snapping"
  :active-widget-id="activeWidgetId"
  :animations-paused="project.animationsPaused"
  @select="selectWidget"
  @change="changeWidget"
/>


        <!-- Section 04C: Canvas Controls -->

        <footer class="canvas-footer">
          <div class="canvas-footer__zoom">
            <button
              type="button"
              aria-label="Fit canvas"
              @click="setZoomMode('fit')"
            >
              −
            </button>

            <span>
              {{ zoomMode === 'fit' ? 'Fit' : '100%' }}
            </span>

            <button
              type="button"
              aria-label="Actual canvas size"
              @click="setZoomMode('actual')"
            >
              ＋
            </button>
          </div>

          <div class="canvas-footer__actions">
            <button
              type="button"
              @click="setZoomMode('fit')"
            >
              Fit to screen
            </button>

            <button
              type="button"
              @click="setZoomMode('actual')"
            >
              Actual size
            </button>
          </div>

          <label class="canvas-footer__safe-zone">
            <span>◉</span>

            Safe zone

            <select v-model="project.safeZone">
              <option :value="true">
                All
              </option>

              <option :value="false">
                Off
              </option>
            </select>
          </label>
        </footer>
      </section>


      <!-- ====================================================
           SHARED INSPECTOR AREA

           This is a VISUAL container only.

           Section 05 and Section 06 remain independent
           logic modules.
           ==================================================== -->

      <aside
        class="
          overlay-inspector-panel
          workspace-zone
          workspace-zone--inspector
        "
      >

        <!-- ==================================================
             INSPECTOR TAB HEADER
             ================================================== -->

        <div
          class="overlay-inspector-tabs"
          role="tablist"
          aria-label="Overlay editor inspector"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="inspectorTab === 'layers'"
            :class="{
              active: inspectorTab === 'layers'
            }"
            @click="inspectorTab = 'layers'"
          >
            <span aria-hidden="true">
              ▤
            </span>

            Layers
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="inspectorTab === 'settings'"
            :class="{
              active: inspectorTab === 'settings'
            }"
            @click="inspectorTab = 'settings'"
          >
            <span aria-hidden="true">
              ⚙
            </span>

            Widget Settings
          </button>
        </div>


        <!-- ==================================================
             OVERLAY SECTION 05
             LAYERS
             ================================================== -->

        <div
          v-show="inspectorTab === 'layers'"
          class="overlay-inspector-content"
          role="tabpanel"
          aria-label="Layers"
        >
          <WidgetLayersPanel
            data-overlay-section="05"
            data-overlay-section-name="layers"
            :widgets="scene.widgets"
            :selected-id="project.selectedWidgetId"
            @select="selectWidget"
            @action="layerAction"
          />
        </div>


        <!-- ==================================================
             OVERLAY SECTION 06
             WIDGET SETTINGS
             ================================================== -->

        <div
          v-show="inspectorTab === 'settings'"
          class="overlay-inspector-content"
          role="tabpanel"
          aria-label="Widget settings"
        >
          <OverlayBuilderInspector
            data-overlay-section="06"
            data-overlay-section-name="widget-settings"
            :widget="selectedWidget"
            :suggestions="suggestions"
            :themes="themes"
            :theme-id="project.themeId"
            @change="changeWidget($event, true)"
            @move="moveSelectedChat"
            @suggestion="applyLocalSuggestion"
          />
        </div>
      </aside>


      <!-- ====================================================
           OVERLAY SECTION 07
           RECENT ACTIVITY
           ==================================================== -->

      <div class="workspace-zone workspace-zone--activity">
        <RecentActivity
          data-overlay-section="07"
          data-overlay-section-name="recent-activity"
          :activities="activities"
          @replay="replay"
        />
      </div>


      <!-- ====================================================
           OVERLAY SECTION 08
           OVERLAY SCENES
           ==================================================== -->

      <div class="workspace-lower workspace-lower--scenes">
        <OverlaySceneSelector
          data-overlay-section="08"
          data-overlay-section-name="overlay-scenes"
          :scenes="project.scenes"
          :selected-id="project.selectedSceneId"
          @select="selectScene"
          @action="sceneAction"
        />
      </div>


      <!-- ====================================================
           OVERLAY SECTION 09
           GAME PREVIEW
           ==================================================== -->

      <div class="workspace-lower workspace-lower--preview">
        <GamePreviewSelector
          data-overlay-section="09"
          data-overlay-section-name="game-preview"
          :preview="scene.preview"
          @change="changePreview"
          @upload="uploadPreview"
        />
      </div>


      <!-- ====================================================
           OVERLAY SECTION 10
           BROWSER SOURCE OUTPUTS
           ==================================================== -->

      <div class="workspace-lower workspace-lower--outputs">
        <BrowserSourceOutputs
          data-overlay-section="10"
          data-overlay-section-name="browser-source-outputs"
          :resolution="scene.resolution"
          :source-url="sourceUrl"
          :publication-id="publicationId"
          :revision="sourceRevision"
          :draft-dirty="dirty"
          :draft-revision="revision"
          :live-out-of-date="liveOutOfDate"
          :live-status-unknown="liveStatusUnknown"
          :last-published-at="lastPublishedAt"
          :selected-scene-id="scene.id"
          :selected-scene-name="scene.name"
          :active-scene-id="activeSceneId"
          :active-scene-name="activeSceneName"
          :busy="sourceBusy"
          :error="sourceError"
          @create="createBrowserSource"
          @update="saveAndUpdateLive"
          @replace="replaceActiveScene"
          @copy="copySourceUrl"
          @open="openSourceUrl"
          @rotate="rotateSourceUrl"
          @revoke="revokeBrowserSource"
          @preview="openBrowserSourcePreview"
        />
      </div>


      <!-- ====================================================
           OVERLAY SECTION 11
           TEST & CONTROLS
           ==================================================== -->

      <div class="workspace-lower workspace-lower--controls">
        <OverlayTestControls
          data-overlay-section="11"
          data-overlay-section-name="test-controls"
          :paused="project.animationsPaused"
          :grid="project.grid"
          :snapping="project.snapping"
          :safe-zone="project.safeZone"
          :chat-selected="
            selectedWidget?.type === 'twitch-chat'
          "
          :chat-locked="selectedWidget?.locked"
          @test="sendSourceTest($event.type)"
          @demo-chat-move="demoChatMove"
          @pause="
            setProject(
              'animationsPaused',
              $event
            )
          "
          @grid="
            setProject(
              'grid',
              $event
            )
          "
          @snapping="
            setProject(
              'snapping',
              $event
            )
          "
          @safe-zone="
            setProject(
              'safeZone',
              $event
            )
          "
          @undo="undo"
          @redo="redo"
          @reset-scene="resetScene"
          @reset-all="resetAll"
        />
      </div>
    </section>


    <!-- ======================================================
         FULL SCREEN OVERLAY PREVIEW
         ====================================================== -->

    <div
      v-if="previewMode"
      class="builder-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Overlay preview"
    >
      <OverlayCanvas
        :overlay="scene"
        preview-mode
        show-preview-background
        :active-widget-id="activeWidgetId"
        :animations-paused="project.animationsPaused"
      />

      <div class="builder-preview__controls">
        <button
          v-for="event in quickTests"
          :key="event.id"
          type="button"
          @click="replay(event)"
        >
          {{ event.label }}
        </button>

        <button
          type="button"
          class="exit"
          @click="previewMode = false"
        >
          Exit Preview
        </button>
      </div>
    </div>


    <!-- ======================================================
         SECTION 01 SUPPORT UI
         HEADER / OBS MODAL
         ====================================================== -->

    <div
      v-if="activeHeaderPanel"
      class="builder-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="
        `${activeHeaderPanel} overlay panel`
      "
      @click.self="closeHeaderPanel"
    >
      <section tabindex="-1">
        <header>
          <div>
            <span>
              Frontend demonstration
            </span>

            <h2>
              {{ headerPanelTitle }}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close"
            @click="closeHeaderPanel"
          >
            ×
          </button>
        </header>


        <!-- Import OBS -->

        <template
          v-if="
            activeHeaderPanel === 'import'
          "
        >
          <p>
            No OBS communication occurs.
            This safely previews a future setup scan.
          </p>

          <button
            v-if="importStep === 'intro'"
            type="button"
            class="modal-primary"
            @click="startObsScan"
          >
            Scan example OBS setup
          </button>

          <p
            v-else-if="
              importStep === 'scanning'
            "
          >
            Scanning the built-in demonstration…
          </p>

          <template
            v-else-if="
              importStep === 'review'
            "
          >
            <label
              v-for="
                item in detectedObsSetup.scenes
              "
              :key="item.id"
            >
              <input
                type="checkbox"
                :checked="item.selected"
                @change="
                  toggleImportedScene(
                    item.id
                  )
                "
              >

              {{ item.name }}
            </label>

            <button
              type="button"
              class="modal-primary"
              @click="confirmObsImport"
            >
              Load selected example scenes
            </button>
          </template>

          <p v-else>
            Demo import complete.
            No OBS files or settings were changed.
          </p>
        </template>


        <!-- Export OBS -->

        <template
          v-else-if="
            activeHeaderPanel === 'export'
          "
        >
          <p>
            Prepare a frontend-only summary for
            {{ publishSummary.overlayName }}.
            No live browser source will be created.
          </p>

          <ul>
            <li>
              {{ publishSummary.scenes }}
              scenes
            </li>

            <li>
              {{ publishSummary.widgets }}
              widgets in the current scene
            </li>

            <li>
              {{ publishSummary.resolution }}
            </li>
          </ul>

          <button
            v-if="exportStep === 'intro'"
            type="button"
            class="modal-primary"
            @click="beginObsExport"
          >
            Review demo export
          </button>

          <button
            v-else-if="
              exportStep === 'review'
            "
            type="button"
            class="modal-primary"
            @click="confirmObsExport"
          >
            Prepare demo export
          </button>

          <p v-else>
            Demo export prepared.
            No OBS changes were made.
          </p>
        </template>


        <!-- Publish -->

        <template
          v-else-if="
            activeHeaderPanel === 'publish'
          "
        >
          <p>
            Publishing remains a frontend preview.
            No overlay URL or backend record will be created.
          </p>

          <button
            v-if="
              publishStep === 'intro'
            "
            type="button"
            class="modal-primary"
            @click="beginPublish"
          >
            Review publish summary
          </button>

          <template
            v-else-if="
              publishStep === 'review'
            "
          >
            <ul>
              <li>
                {{ publishSummary.scenes }}
                overlay scenes
              </li>

              <li>
                Current output
                {{ publishSummary.resolution }}
              </li>
            </ul>

            <button
              type="button"
              class="modal-primary"
              @click="confirmPublish"
            >
              Mark ready for future publishing
            </button>
          </template>

          <p v-else>
            Ready for future publishing.
            Nothing is currently published.
          </p>
        </template>


        <!-- OBS Connection -->

        <template v-else>
          <p>
            {{ obsStatusLabel }}.
            The OBS plugin is not implemented in this demo.
          </p>

          <button
            v-if="!obsConnection.connected"
            type="button"
            class="modal-primary"
            @click="simulateObsConnection"
          >
            Simulate connection
          </button>

          <button
            v-else
            type="button"
            class="modal-primary"
            @click="simulateObsDisconnect"
          >
            Disconnect simulation
          </button>
        </template>
      </section>
    </div>
  </main>
</template>


<script setup>
// ============================================================
// PROJECT RESPAWN
// OVERLAY EDITOR
//
// SECTION MAP
//
// 01 Header
// 02 Demo Information Bar
// 03 Widget Library
// 04 Main Overlay Canvas
// 05 Layers
// 06 Widget Settings
// 07 Recent Activity
// 08 Overlay Scenes
// 09 Game Preview
// 10 Browser Source Outputs
// 11 Test & Controls
//
// IMPORTANT:
// Section logic remains inside /logic/.
// This file controls page layout and wiring only.
// ============================================================


// ============================================================
// VUE
// ============================================================

import {
  onMounted,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'


// ============================================================
// VISUAL COMPONENTS
// ============================================================

import OverlayBuilderToolbar
  from '../../components/overlays/OverlayBuilderToolbar.vue'

import WidgetLibrary
  from '../../components/overlays/WidgetLibrary.vue'

import OverlayCanvas
  from '../../components/overlays/OverlayCanvas.vue'

import WidgetLayersPanel
  from '../../components/overlays/WidgetLayersPanel.vue'

import OverlayBuilderInspector
  from '../../components/overlays/OverlayBuilderInspector.vue'

import RecentActivity
  from '../../components/overlays/RecentActivity.vue'

import OverlaySceneSelector
  from '../../components/overlays/OverlaySceneSelector.vue'

import GamePreviewSelector
  from '../../components/overlays/GamePreviewSelector.vue'

import BrowserSourceOutputs
  from '../../components/overlays/BrowserSourceOutputs.vue'

import OverlayTestControls
  from '../../components/overlays/OverlayTestControls.vue'


// ============================================================
// SECTION LOGIC
// ============================================================

import {
  useOverlayEditorCore,
  useOverlayHeader,
  useDemoInformationBar,
  useWidgetLibrary,
  useMainCanvas,
  useLayers,
  useWidgetSettings,
  useRecentActivity,
  useOverlayScenes,
  useGamePreview,
  useBrowserSources,
  useTestControls,
} from './logic/index.js'


// ============================================================
// PAGE LAYOUT STATE
//
// This state belongs to the editor shell because it controls
// which visual inspector tab is visible.
//
// Section 05 and Section 06 logic remains separate.
// ============================================================

const inspectorTab =
  ref('layers')


// ============================================================
// CORE EDITOR STATE
// ============================================================

const route =
  useRoute()
const router =
  useRouter()

const core =
  useOverlayEditorCore(route, router)

const {
  project,
  history,
  notice,
  offerWidget,
  activeWidgetId,
  previewMode,
  scene,
  selectedWidget,
  commit,
  selectWidget,
  changeWidget,
  saveDemo,
  loading,
  saving,
  dirty,
  revision,
  workspaceId,
  brandId,
  brandContext,
} = core


// ============================================================
// SECTION 02
// DEMO INFORMATION BAR
// ============================================================

const {
  demoInformation,
} =
  useDemoInformationBar()


// ============================================================
// SECTION 03
// WIDGET LIBRARY
// ============================================================

const {
  toggleWidget,
} =
  useWidgetLibrary({
    project,
    scene,
    commit,
    selectWidget,
  })


// ============================================================
// SECTION 04
// MAIN OVERLAY CANVAS
// ============================================================

const {
  zoomMode,
  setZoomMode,
} =
  useMainCanvas({
    selectWidget,
    changeWidget,
  })


// ============================================================
// SECTION 05
// LAYERS
// ============================================================

const {
  layerAction,
} =
  useLayers({
    scene,
    commit,
    selectWidget,
  })


// ============================================================
// SECTION 06
// WIDGET SETTINGS
// ============================================================

const settings =
  useWidgetSettings({
    project,
    scene,
    selectedWidget,
    commit,
    selectWidget,
    changeWidget,
  })

const {
  suggestions,
  moveSelectedChat,
  applyLocalSuggestion,
} = settings


// ============================================================
// SECTION 07
// RECENT ACTIVITY
// ============================================================

const {
  activities,
  replay,
} =
  useRecentActivity({
    ...core,
    project,
    scene,
    notice,
    offerWidget,
    activeWidgetId,
    selectWidget,
  })


// ============================================================
// SECTION 08
// OVERLAY SCENES
// ============================================================

const {
  selectScene,
  sceneAction,
} =
  useOverlayScenes({
    project,
    scene,
    notice,
    commit,
  })


// ============================================================
// SECTION 09
// GAME PREVIEW
// ============================================================

const {
  changePreview,
  uploadPreview,
} =
  useGamePreview({
    scene,
    notice,
    commit,
    registerCleanup:
      core.registerCleanup,
  })


// ============================================================
// SECTION 10
// BROWSER SOURCE OUTPUTS
// ============================================================

const {
  publicationId,
  sourceUrl,
  sourceRevision,
  sourceEditorRevision,
  activeSceneId,
  activeSceneName,
  sourceBusy,
  sourceError,
  hasActivePublication,
  liveStatusUnknown,
  liveOutOfDate,
  lastPublishedAt,
  refreshSourceState,
  createBrowserSource,
  saveAndUpdateLive,
  replaceActiveScene,
  copySourceUrl,
  openSourceUrl,
  rotateSourceUrl,
  revokeBrowserSource,
  sendSourceTest,
  openBrowserSourcePreview,
} =
  useBrowserSources({
    notice,
    previewMode,
    project,
    scene,
    dirty,
    revision,
    workspaceId,
    brandId,
    brandContext,
    saveDraft: saveDemo,
  })

onMounted(refreshSourceState)


// ============================================================
// SECTION 01
// HEADER
// ============================================================

const header =
  useOverlayHeader({
    project,
    scene,
    commit,
    notice,
    saveDemo,
    focusSettings:
      settings.focusSettings,
  })

const {
  activeHeaderPanel,
  headerPanelTitle,
  importStep,
  exportStep,
  publishStep,
  obsConnection,
  obsStatusLabel,
  detectedObsSetup,
  publishSummary,
  themes,
  themeVars,
  renameProject,
  changeTheme,
  openHeaderPanel,
  closeHeaderPanel,
  startObsScan,
  toggleImportedScene,
  confirmObsImport,
  beginObsExport,
  confirmObsExport,
  beginPublish,
  confirmPublish,
  openObsConnection,
  simulateObsConnection,
  simulateObsDisconnect,
} = header


// ============================================================
// SECTION 11
// TEST & CONTROLS
// ============================================================

const controls =
  useTestControls({
    ...core,
    project,
    history,
    scene,
    selectedWidget,
    notice,
    previewMode,
    changeWidget,
    toggleWidget,
    replay,
    commit,
    closeHeaderPanel,
    activeHeaderPanel,
  })

const {
  quickTests,
  setProject,
  demoChatMove,
  undo,
  redo,
  resetScene,
  resetAll,
  closeTopLayer,
} = controls
</script>


<style src="./OverlayEditor.css"></style>

<style src="../../widgets/widgets.css"></style>
