export function ttsDeliveryStatus(result) {
  const delivered = Number(result?.delivered || 0), failed = Number(result?.failed || 0);
  if (failed > 0) return { type: 'error', message: `TTS reached ${delivered} Browser Source connection(s); ${failed} delivery attempt(s) failed.` };
  if (delivered === 0) return { type: 'info', message: 'No active Browser Source received the test. Open your published source in OBS or a browser and try again.' };
  return { type: 'success', message: `TTS sent to ${delivered} Browser Source connection(s). Check the source audio to confirm playback.` };
}
