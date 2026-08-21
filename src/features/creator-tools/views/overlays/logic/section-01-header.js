// ============================================================
// PROJECT RESPAWN - OVERLAY EDITOR
// SECTION 01 - HEADER
// ============================================================
//
// PURPOSE
//
// Controls header-level Overlay Editor actions:
//
// - Import OBS Setup
// - Export to OBS
// - Publish Overlay
// - OBS Connection Status
//
// CURRENT STATE
//
// Frontend behaviour only.
// No real OBS communication occurs yet.
//
// FUTURE BACKEND / OBS PLUGIN
//
// This file is intentionally structured so Codex can later replace
// simulated responses with:
// - OBS plugin connection state
// - OBS scene/source discovery
// - OBS scene mapping
// - Browser source creation
// - Published overlay URLs
//
// ============================================================

import { computed, ref } from 'vue'
import { overlayThemes, themeVariables } from '../../../overlays/overlayThemes.js'

export function useOverlayHeader(options = {}) {
  const {
    project,
    scene,
    scenes,
    widgets,
    commit = () => {},
    notice,
    saveDemo = () => {},
    focusSettings = () => '',
  } = options

  // ----------------------------------------------------------
  // PANEL STATE
  // ----------------------------------------------------------

  const activeHeaderPanel = ref('')
  const importStep = ref('intro')
  const exportStep = ref('intro')
  const publishStep = ref('intro')

  // Future OBS plugin will replace this object.
  const obsConnection = ref({
    connected: false,
    status: 'disconnected',
    obsVersion: null,
    computerName: null,
    mappedScenes: 0,
    activeOverlays: 0,
  })

  // ----------------------------------------------------------
  // SIMULATED OBS DATA
  // ----------------------------------------------------------

  const detectedObsSetup = ref({
    scenes: [
      {
        id: 'obs-starting-soon',
        name: 'Starting Soon',
        selected: true,
      },
      {
        id: 'obs-main-gameplay',
        name: 'Main Gameplay',
        selected: true,
      },
      {
        id: 'obs-just-chatting',
        name: 'Just Chatting',
        selected: true,
      },
      {
        id: 'obs-brb',
        name: 'BRB',
        selected: true,
      },
      {
        id: 'obs-stream-ending',
        name: 'Stream Ending',
        selected: true,
      },
    ],

    sources: [
      {
        id: 'source-game-capture',
        name: 'Game Capture',
        type: 'Game Capture',
        selected: true,
      },
      {
        id: 'source-webcam',
        name: 'Webcam',
        type: 'Video Capture Device',
        selected: true,
      },
      {
        id: 'source-browser',
        name: 'Existing Browser Source',
        type: 'Browser Source',
        selected: true,
      },
      {
        id: 'source-microphone',
        name: 'Microphone',
        type: 'Audio Input',
        selected: false,
      },
      {
        id: 'source-alerts',
        name: 'Alerts',
        type: 'Browser Source',
        selected: true,
      },
    ],
  })

  // ----------------------------------------------------------
  // COMPUTED DATA
  // ----------------------------------------------------------

  const obsStatusLabel = computed(() =>
    obsConnection.value.connected
      ? 'OBS connected'
      : 'No OBS connection'
  )
  const headerPanelTitle = computed(() => ({
    import: 'Import OBS Setup',
    export: 'Export to OBS',
    publish: 'Publish Overlay',
    'obs-connection': 'OBS Connection',
  }[activeHeaderPanel.value] || 'Overlay settings'))

  const currentScene = computed(() => {
    if (scene?.value) return scene.value
    if (typeof scene === 'object' && scene) return scene
    return null
  })

  const projectScenes = computed(() => {
    if (scenes?.value) return scenes.value
    if (Array.isArray(scenes)) return scenes
    if (project?.scenes) return project.scenes
    return []
  })

  const currentWidgets = computed(() => {
    if (widgets?.value) return widgets.value
    if (Array.isArray(widgets)) return widgets
    return currentScene.value?.widgets || []
  })

  const publishSummary = computed(() => ({
    overlayName:
      project?.name ||
      project?.value?.name ||
      'Creator Overlay',

    scenes: projectScenes.value.length,

    widgets: currentWidgets.value.length,

    resolution: currentScene.value?.resolution
      ? `${currentScene.value.resolution.width} × ${currentScene.value.resolution.height}`
      : '1920 × 1080',
  }))
  const themes = Object.values(overlayThemes)
  const themeVars = computed(() => themeVariables(project?.themeId || project?.value?.themeId))

  function renameProject(name) {
    if (!String(name).trim()) return
    project.name = String(name).trim()
    commit('Project name updated')
  }

  function changeTheme(id) {
    project.themeId = id
    for (const projectScene of project.scenes) {
      for (const widget of projectScene.widgets) widget.themeId = id
    }
    commit(`${overlayThemes[id].name} theme applied`)
  }

  function focusWidgetSettings() {
    if (notice) notice.value = focusSettings()
  }

  // ----------------------------------------------------------
  // PANEL CONTROLS
  // ----------------------------------------------------------

  function openHeaderPanel(panel) {
    activeHeaderPanel.value = panel

    if (panel === 'import') {
      importStep.value = 'intro'
    }

    if (panel === 'export') {
      exportStep.value = 'intro'
    }

    if (panel === 'publish') {
      publishStep.value = 'intro'
    }
  }

  function closeHeaderPanel() {
    activeHeaderPanel.value = ''
  }

  // ----------------------------------------------------------
  // IMPORT OBS
  // ----------------------------------------------------------

  function startObsScan() {
    importStep.value = 'scanning'

    window.setTimeout(() => {
      importStep.value = 'review'
    }, 900)
  }

  function toggleImportedScene(id) {
    const item = detectedObsSetup.value.scenes.find(
      sceneItem => sceneItem.id === id
    )

    if (item) {
      item.selected = !item.selected
    }
  }

  function toggleImportedSource(id) {
    const item = detectedObsSetup.value.sources.find(
      source => source.id === id
    )

    if (item) {
      item.selected = !item.selected
    }
  }

  function confirmObsImport() {
    project.obsMappings = detectedObsSetup.value.scenes
      .filter(item => item.selected)
      .map(item => ({ obsScene: item.name, respawnScene: item.name }))
    importStep.value = 'complete'
    commit('Demo import complete · No OBS files or settings were changed')
  }

  // ----------------------------------------------------------
  // EXPORT TO OBS
  // ----------------------------------------------------------

  function beginObsExport() {
    exportStep.value = 'review'
  }

  function confirmObsExport() {
    exportStep.value = 'complete'
    if (notice) notice.value = 'Demo export prepared · No OBS changes were made'
  }

  // ----------------------------------------------------------
  // PUBLISH OVERLAY
  // ----------------------------------------------------------

  function beginPublish() {
    publishStep.value = 'review'
  }

  function confirmPublish() {
    project.publishReady = true
    publishStep.value = 'complete'
    commit('Ready for future publishing · Nothing is currently published')
  }

  // ----------------------------------------------------------
  // OBS CONNECTION
  // ----------------------------------------------------------

  function openObsConnection() {
    openHeaderPanel('obs-connection')
  }

  // Temporary frontend simulation.
  // Remove/replace once the OBS plugin exists.
  function simulateObsConnection() {
    obsConnection.value = {
      connected: true,
      status: 'connected',
      obsVersion: 'Future OBS Plugin',
      computerName: 'Demo Computer',
      mappedScenes: projectScenes.value.length,
      activeOverlays: 1,
    }
  }

  function simulateObsDisconnect() {
    obsConnection.value = {
      connected: false,
      status: 'disconnected',
      obsVersion: null,
      computerName: null,
      mappedScenes: 0,
      activeOverlays: 0,
    }
  }

  // ----------------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------------

  return {
    activeHeaderPanel,

    importStep,
    exportStep,
    publishStep,

    obsConnection,
    obsStatusLabel,
    headerPanelTitle,

    detectedObsSetup,
    publishSummary,
    themes,
    themeVars,
    renameProject,
    changeTheme,
    saveDemo,
    focusWidgetSettings,

    openHeaderPanel,
    closeHeaderPanel,

    startObsScan,
    toggleImportedScene,
    toggleImportedSource,
    confirmObsImport,

    beginObsExport,
    confirmObsExport,

    beginPublish,
    confirmPublish,

    openObsConnection,
    simulateObsConnection,
    simulateObsDisconnect,
  }
}

// ============================================================
// END SECTION 01
// ============================================================
