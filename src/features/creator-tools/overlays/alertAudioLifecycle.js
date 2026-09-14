export function createAlertAudioLifecycle({ AudioImpl = globalThis.Audio, onError = (error) => console.warn('Alert audio playback failed', error) } = {}) {
  let audio = null
  function stop() {
    if (!audio) return
    try { audio.pause(); audio.currentTime = 0; audio.removeAttribute?.('src'); audio.load?.() } catch (error) { onError(error) }
    audio = null
  }
  async function play(url, volume) {
    stop()
    if (!url || typeof AudioImpl !== 'function') return false
    try {
      audio = new AudioImpl(url); audio.preload = 'auto'; audio.volume = Math.min(1, Math.max(0, Number(volume) || 0))
      await audio.play(); return true
    } catch (error) { onError(error); stop(); return false }
  }
  return { play, stop, get active() { return audio } }
}
