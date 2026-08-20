import {
  computed,
} from 'vue'

import {
  applySuggestion,
  generateSuggestions,
} from '../../../overlays/overlayBuilderSuggestions.js'

import {
  getWidgetByType,
} from '../../../widgets/registry/index.js'


// ============================================================
// PROJECT RESPAWN
// SECTION 06 — WIDGET SETTINGS
//
// 06A Suggestions
// 06B Layout Actions
// 06C Reset Actions
// 06D Test / Replay
// 06E Focus Behaviour
//
// IMPORTANT:
//
// Widget movement belongs to Section 04.
// Twitch-specific movement controls do NOT belong here.
// ============================================================

export function useWidgetSettings({
  project,
  scene,
  selectedWidget,
  commit,
  selectWidget,
  changeWidget,
}) {

  // ==========================================================
  // 06A
  // SUGGESTIONS
  // ==========================================================

  const suggestions =
    computed(() => {
      return generateSuggestions(
        scene.value,
        scene.value.preview,
      )
    })


  // ==========================================================
  // 06B
  // LAYOUT ACTIONS
  // ==========================================================

  function layoutAction(action) {
    const widget =
      selectedWidget.value

    if (!widget) {
      return
    }

    const canvas =
      scene.value.resolution

    const frame = {
      ...widget.frame,
    }


    // --------------------------------------------------------
    // HORIZONTAL ALIGNMENT
    // --------------------------------------------------------

    if (action === 'left') {
      frame.x = 0
    }

    if (
      action === 'h-centre' ||
      action === 'centre'
    ) {
      frame.x =
        Math.round(
          (
            canvas.width -
            frame.width
          ) / 2,
        )
    }

    if (action === 'right') {
      frame.x =
        Math.max(
          0,
          canvas.width -
          frame.width,
        )
    }


    // --------------------------------------------------------
    // VERTICAL ALIGNMENT
    // --------------------------------------------------------

    if (action === 'top') {
      frame.y = 0
    }

    if (
      action === 'v-centre' ||
      action === 'centre'
    ) {
      frame.y =
        Math.round(
          (
            canvas.height -
            frame.height
          ) / 2,
        )
    }

    if (action === 'bottom') {
      frame.y =
        Math.max(
          0,
          canvas.height -
          frame.height,
        )
    }


    // --------------------------------------------------------
    // RESET POSITION
    // --------------------------------------------------------

    if (
      action === 'reset-position'
    ) {
      frame.x = 80
      frame.y = 80
    }


    // --------------------------------------------------------
    // RESET SIZE
    // --------------------------------------------------------

    if (
      action === 'reset-size'
    ) {
      const definition =
        getWidgetByType(
          widget.type,
        )

      if (
        definition?.defaultSize
      ) {
        frame.width =
          definition.defaultSize.width

        frame.height =
          definition.defaultSize.height
      }
    }


    // --------------------------------------------------------
    // APPLY
    // --------------------------------------------------------

    changeWidget(
      {
        ...widget,
        frame,
      },
      true,
    )
  }


  // ==========================================================
  // 06C
  // TEST SELECTED WIDGET
  //
  // This remains deliberately lightweight for the demo.
  // Section 07 / Section 11 can later own richer event replay.
  // ==========================================================

  function testSelectedWidget() {
    const widget =
      selectedWidget.value

    if (!widget) {
      return null
    }

    selectWidget(
      widget.id,
    )

    commit(
      `${widget.name} test requested`,
    )

    return widget
  }


  // ==========================================================
  // 06D
  // APPLY SUGGESTION
  // ==========================================================

  function applyLocalSuggestion(item) {
    const index =
      project.scenes.findIndex(
        candidate =>
          candidate.id ===
          scene.value.id,
      )

    project.scenes[index] =
      applySuggestion(
        scene.value,
        item,
      )

    selectWidget(
      item.widgetId || '',
    )

    commit(
      `${item.actionLabel} applied · Undo is available`,
    )
  }


  // ==========================================================
  // 06E
  // FOCUS SETTINGS
  // ==========================================================

  function focusSettings() {
    project.selectedWidgetId =
      scene.value.widgets[0]
        ?.id || ''

    return project.selectedWidgetId
      ? 'Widget settings ready'
      : 'Add a widget to configure settings'
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    suggestions,
    layoutAction,
    testSelectedWidget,
    applyLocalSuggestion,
    focusSettings,
  }
}