import { ref } from 'vue'
import { createReplayController, recentDemoActivities, routeDemoEvent } from '../../../overlays/overlayBuilderEvents.js'

export function useRecentActivity({ project, scene, notice, offerWidget, activeWidgetId, selectWidget, registerCleanup }) {
  const activities = ref(recentDemoActivities.map(item => ({ ...item })))
  const reducedMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const replayController = createReplayController({ onClear: () => { activeWidgetId.value = '' } })

  function replay(event) {
    const result = routeDemoEvent(scene.value, event)
    notice.value = result.message
    offerWidget.value = result.ok ? '' : event.targetWidgetType
    if (!result.ok) return
    selectWidget(result.widgetId)
    activeWidgetId.value = result.widgetId
    if (!project.animationsPaused) replayController.trigger(result.widgetId, reducedMotion)
    activities.value = [
      { ...event, id: `${event.id}-${activities.value.length}`, createdAtLabel: 'just now' },
      ...activities.value.filter(item => item.id !== event.id),
    ].slice(0, 10)
  }

  registerCleanup(() => replayController.clear())
  return { activities, replay, reducedMotion }
}
