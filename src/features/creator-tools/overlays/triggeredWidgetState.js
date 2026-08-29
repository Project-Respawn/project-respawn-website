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
  onExpiring = () => {},
  runtimeSettings = null,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  let timer = null; let exitTimer = null;
  const topics = Array.isArray(widget?.dataSource?.topics) ? widget.dataSource.topics : [];
  const show = (event) => {
    const activeSettings = typeof runtimeSettings === 'function' ? runtimeSettings(event) : runtimeSettings;
    if (activeSettings?.enabled === false) return;
    onVisibility(true); onExpiring(false);
    if (timer) clearTimer(timer); if (exitTimer) clearTimer(exitTimer);
    const duration = triggerDurationMs(widget, activeSettings);
    exitTimer = setTimer(() => { exitTimer = null; onExpiring(); }, Math.max(0, duration - 300));
    timer = setTimer(() => {
      timer = null;
      onVisibility(false);
      onExpired();
    }, duration);
  };
  const unsubscribers = topics.map((topic) => bus.subscribe(topic, show));
  return () => {
    if (timer) clearTimer(timer); if (exitTimer) clearTimer(exitTimer);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}
