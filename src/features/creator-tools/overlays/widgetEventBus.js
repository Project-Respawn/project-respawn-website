import { cloneSerializableData } from './overlaySnapshots.js';

export function createWidgetEventBus() {
  const topics = new Map();
  return {
    subscribe(topic, handler) {
      const listeners = topics.get(topic) || new Set();
      listeners.add(handler); topics.set(topic, listeners);
      return () => listeners.delete(handler);
    },
    publish(event) {
      for (const handler of topics.get(event.topic) || []) handler(cloneSerializableData(event));
      for (const handler of topics.get('*') || []) handler(cloneSerializableData(event));
    },
    clear() { topics.clear(); },
  };
}

export const widgetEventBus = createWidgetEventBus();
