import { onBeforeUnmount, onMounted, ref } from 'vue'
import { demoEventBus } from '../overlays/demoEventBus.js'

export function widgetStyle(settings) {
  return { background: settings.background, opacity: settings.opacity, borderRadius: `${settings.cornerRadius || 0}px`, textAlign: settings.textAlign || 'left', fontSize: settings.fontSize ? `${settings.fontSize}px` : undefined }
}

export function useWidgetEvents(widget, initial) {
  const event = ref(structuredClone(initial))
  const unsubscribers = []
  onMounted(() => { for (const topic of widget.dataSource?.topics || []) unsubscribers.push(demoEventBus.subscribe(topic, (next) => { event.value = next })) })
  onBeforeUnmount(() => unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe()))
  return event
}
