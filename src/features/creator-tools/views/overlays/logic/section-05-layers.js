// ============================================================
// PROJECT RESPAWN
// SECTION 05 — LAYERS
//
// RESPONSIBILITIES
//
// 05A Selection
// 05B Visibility
// 05C Display Mode
// 05D Locking
// 05E Layer Ordering
// ============================================================

export function useLayers({
  scene,
  commit,
  selectWidget,
}) {

  // ==========================================================
  // 05E
  // NORMALISE Z-INDEX
  // ==========================================================

  function normalizeLayers() {
    ;[...scene.value.widgets]
      .sort(
        (a, b) =>
          a.zIndex - b.zIndex,
      )
      .forEach(
        (widget, index) => {
          widget.zIndex =
            index + 1
        },
      )
  }


  // ==========================================================
  // 05B
  // VISIBILITY
  //
  // IMPORTANT:
  // enabled = widget belongs to this scene
  // hidden  = temporarily not visible
  // ==========================================================

  function toggleVisibility(widget) {
    widget.hidden =
      !widget.hidden
  }


  // ==========================================================
  // 05C
  // DISPLAY MODE
  //
  // always
  // triggered
  // ==========================================================

  function changeDisplayMode(
    widget,
    value,
  ) {
    widget.displayMode =
      value === 'triggered'
        ? 'triggered'
        : 'always'
  }


  // ==========================================================
  // 05D
  // LOCKING
  // ==========================================================

  function toggleLock(widget) {
    widget.locked =
      !widget.locked
  }


  // ==========================================================
  // 05E
  // LAYER ORDER
  // ==========================================================

  function changeLayerOrder(
    widget,
    action,
  ) {
    const max =
      Math.max(
        1,
        ...scene.value.widgets.map(
          item =>
            item.zIndex,
        ),
      )

    if (
      action === 'forward'
    ) {
      widget.zIndex =
        Math.min(
          max,
          widget.zIndex + 1,
        )
    }

    if (
      action === 'backward'
    ) {
      widget.zIndex =
        Math.max(
          1,
          widget.zIndex - 1,
        )
    }

    if (
      action === 'front'
    ) {
      widget.zIndex =
        max + 1
    }

    if (
      action === 'back'
    ) {
      widget.zIndex =
        0
    }

    normalizeLayers()
  }


  // ==========================================================
  // SECTION 05
  // PUBLIC ACTION ROUTER
  // ==========================================================

  function layerAction(
    action,
    id,
    value,
  ) {
    const widget =
      scene.value.widgets.find(
        item =>
          item.id === id,
      )

    if (!widget) {
      return
    }


    // --------------------------------------------------------
    // VISIBILITY
    // --------------------------------------------------------

    if (
      action === 'visibility'
    ) {
      toggleVisibility(widget)
    }


    // --------------------------------------------------------
    // DISPLAY MODE
    // --------------------------------------------------------

    if (
      action === 'display-mode'
    ) {
      changeDisplayMode(
        widget,
        value,
      )
    }


    // --------------------------------------------------------
    // LOCK
    // --------------------------------------------------------

    if (
      action === 'lock'
    ) {
      toggleLock(widget)
    }


    // --------------------------------------------------------
    // STACKING
    // --------------------------------------------------------

    if (
      [
        'forward',
        'backward',
        'front',
        'back',
      ].includes(action)
    ) {
      changeLayerOrder(
        widget,
        action,
      )
    }


    // --------------------------------------------------------
    // KEEP SELECTION SYNCHRONISED
    // --------------------------------------------------------

    selectWidget(id)


    // --------------------------------------------------------
    // LOCAL DEMO HISTORY
    // --------------------------------------------------------

    commit(
      layerCommitLabel(
        action,
        widget,
      ),
    )
  }


  // ==========================================================
  // SECTION 05
  // HISTORY LABELS
  // ==========================================================

  function layerCommitLabel(
    action,
    widget,
  ) {
    if (
      action === 'visibility'
    ) {
      return widget.hidden
        ? 'Layer hidden'
        : 'Layer shown'
    }

    if (
      action === 'display-mode'
    ) {
      return widget.displayMode ===
        'triggered'
        ? 'Layer set to triggered'
        : 'Layer set to always visible'
    }

    if (
      action === 'lock'
    ) {
      return widget.locked
        ? 'Layer locked'
        : 'Layer unlocked'
    }

    return 'Layer order updated'
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    layerAction,
  }
}