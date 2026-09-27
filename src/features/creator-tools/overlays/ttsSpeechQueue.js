// One speech queue per Browser Source, shared by all TTS widget instances.
// Event IDs prevent a second widget (or a replay) from speaking the same event.
export function createTtsSpeechQueue({
  synthesis = () => globalThis.window?.speechSynthesis,
  createUtterance = text => new globalThis.SpeechSynthesisUtterance(text),
  log = entry => console.info('[TTS playback]', entry),
} = {}) {
  const pending = [], seen = new Set();
  let current = null;
  const report = (stage, item, extra = {}) => log({ stage, eventId: item?.id, textLength: item?.text.length || 0, ...extra });
  function next() {
    if (current || !pending.length) return;
    const item = pending.shift();
    const engine = synthesis();
    if (!engine) { report('speech_failed', item, { errorCode: 'unsupported' }); next(); return; }
    let utterance;
    try {
      utterance = createUtterance(item.text);
      current = { item, utterance };
      utterance.rate = item.config.rate;
      utterance.pitch = item.config.pitch;
      utterance.volume = item.config.volume;
      // Voices can load after page mount; resolve against the engine at playback.
      const voice = engine.getVoices().find(voice => voice.name === item.config.voice);
      if (voice) utterance.voice = voice;
      else if (item.config.voice) report('voice_fallback', item);
      const finish = (stage, errorCode) => {
        if (current?.utterance !== utterance) return;
        report(stage, item, errorCode ? { errorCode } : {});
        current = null;
        next();
      };
      utterance.onstart = () => report('speech_started', item);
      utterance.onend = () => finish('speech_ended');
      utterance.onerror = event => finish('speech_failed', event.error || 'unknown');
      engine.speak(utterance);
    } catch {
      report('speech_failed', item, { errorCode: 'engine_error' });
      current = null;
      next();
    }
  }
  return {
    enqueue(event, config = {}, widget = {}) {
      if (config.enabled === false || widget.enabled === false || widget.hidden === true) return false;
      const clamp = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
      const text = String(event?.payload?.text || '').trim().slice(0, clamp(config.maxLength ?? 200, 200, 1, 500));
      const id = String(event?.id || '');
      if (!text || !id || seen.has(id)) return false;
      if (pending.length >= 100) { report('speech_skipped', { id, text }, { errorCode: 'queue_full' }); return false; }
      seen.add(id);
      if (seen.size > 1000) seen.delete(seen.values().next().value);
      const item = { id, text, config: { voice: config.voice || '',
        rate: clamp(config.rate ?? 1, 1, .5, 2), pitch: clamp(config.pitch ?? 1, 1, 0, 2), volume: clamp(config.volume ?? 1, 1, 0, 1) } };
      pending.push(item);
      report('speech_queued', item, { queueLength: pending.length });
      next();
      return true;
    },
    stop() {
      const active = current;
      current = null;
      pending.length = 0;
      seen.clear();
      if (active) {
        active.utterance.onstart = active.utterance.onend = active.utterance.onerror = null;
        synthesis()?.cancel();
      }
    },
  };
}

export const browserTtsQueue = createTtsSpeechQueue();
