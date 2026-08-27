const DEFAULT_TRIGGER_DURATION_MS = 6000;

export function triggerDurationMs(widget, runtimeSettings) {
  const seconds = Number(runtimeSettings?.duration ?? widget?.settings?.duration);
  return Number.isFinite(seconds) && seconds > 0
    ? Math.min(seconds * 1000, 60_000)
    : DEFAULT_TRIGGER_DURATION_MS;
}

export function createTriggeredWidgetSubscription(widget, {
  bus,
  onVisibility,
  onExpired = () => {},
  runtimeSettings = null,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  let timer = null;
  const topics = Array.isArray(widget?.dataSource?.topics) ? widget.dataSource.topics : [];
  const show = (event) => {
    const activeSettings = typeof runtimeSettings === 'function' ? runtimeSettings(event) : runtimeSettings;
    if (activeSettings?.enabled === false) return;
    onVisibility(true);
    if (timer) clearTimer(timer);
    timer = setTimer(() => {
      timer = null;
      onVisibility(false);
      onExpired();
    }, triggerDurationMs(widget, activeSettings));
  };
  const unsubscribers = topics.map((topic) => bus.subscribe(topic, show));
  return () => {
    if (timer) clearTimer(timer);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}
