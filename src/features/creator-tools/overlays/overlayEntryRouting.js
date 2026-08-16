export function chooseEntryOverlayId(overlays, recentId) {
  if (recentId && overlays.some((overlay) => overlay.id === recentId)) return recentId
  return overlays.find((overlay) => overlay.name === 'Main Gameplay')?.id || overlays[0]?.id || ''
}
