export function calculateOverlayStage(sceneWidth, sceneHeight, viewportWidth, viewportHeight) {
  const width = Number(sceneWidth);
  const height = Number(sceneHeight);
  const availableWidth = Number(viewportWidth);
  const availableHeight = Number(viewportHeight);
  if (![width, height, availableWidth, availableHeight].every((value) => Number.isFinite(value) && value > 0)) {
    return { scale: 1, x: 0, y: 0 };
  }
  const scale = Math.min(availableWidth / width, availableHeight / height);
  const centerX = (availableWidth - width * scale) / 2;
  const centerY = (availableHeight - height * scale) / 2;
  return {
    scale,
    x: Math.abs(centerX) < Number.EPSILON * availableWidth ? 0 : centerX,
    y: Math.abs(centerY) < Number.EPSILON * availableHeight ? 0 : centerY,
  };
}
