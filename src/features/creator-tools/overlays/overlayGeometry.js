export const SNAP_DISTANCE = 10
export const DEFAULT_GRID_SIZE = 20

export function clamp(value, min, max) { return Math.min(max, Math.max(min, value)) }

export function editorScale(canvasWidth, canvasHeight, availableWidth, availableHeight, padding = 0) {
  if (![canvasWidth, canvasHeight, availableWidth, availableHeight].every((value) => Number(value) > 0)) return 1
  return Math.min(Math.max(1, availableWidth - padding * 2) / canvasWidth, Math.max(1, availableHeight - padding * 2) / canvasHeight)
}

export function canvasScalesFromBounds(bounds, resolution) {
  const x = Number(bounds?.width) / Number(resolution?.width)
  const y = Number(bounds?.height) / Number(resolution?.height)
  return x > 0 && y > 0 && Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
}

export function clientDeltaToCanvas(deltaX, deltaY, scaleX, scaleY = scaleX) {
  const safeX = Number(scaleX) > 0 ? Number(scaleX) : 1
  const safeY = Number(scaleY) > 0 ? Number(scaleY) : 1
  return { x: deltaX / safeX, y: deltaY / safeY }
}

export function detectResizeDirection(clientX, clientY, bounds, threshold = 9) {
  if (![clientX, clientY, bounds?.left, bounds?.top, bounds?.width, bounds?.height].every(Number.isFinite) || bounds.width <= 0 || bounds.height <= 0) return null
  const edge = Math.max(0, Math.min(Number(threshold) || 0, bounds.width / 4, bounds.height / 4))
  const right = Number.isFinite(bounds.right) ? bounds.right : bounds.left + bounds.width
  const bottom = Number.isFinite(bounds.bottom) ? bounds.bottom : bounds.top + bounds.height
  const horizontal = clientX - bounds.left <= edge ? 'w' : right - clientX <= edge ? 'e' : ''
  const vertical = clientY - bounds.top <= edge ? 'n' : bottom - clientY <= edge ? 's' : ''
  return vertical && horizontal ? `${vertical}${horizontal}` : vertical || horizontal || null
}

function closestSnap(points, targets, distance = SNAP_DISTANCE) {
  let best = null
  for (const point of points) for (const target of targets) {
    const delta = target - point
    if (Math.abs(delta) <= distance && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, guide: target }
  }
  return best
}

function axisTargets(others, axis, boundsSize) {
  const position = axis === 'x' ? 'x' : 'y'
  const size = axis === 'x' ? 'width' : 'height'
  const targets = [0, boundsSize / 2, boundsSize]
  for (const frame of others) targets.push(frame[position], frame[position] + frame[size] / 2, frame[position] + frame[size])
  return targets
}

function gridTargets(points, gridSize) {
  return gridSize > 0 ? points.map((point) => Math.round(point / gridSize) * gridSize) : []
}

export function moveFrame(frame, delta, bounds, others = [], snap = true, options = {}) {
  let x = clamp(frame.x + delta.x, 0, Math.max(0, bounds.width - frame.width))
  let y = clamp(frame.y + delta.y, 0, Math.max(0, bounds.height - frame.height))
  const guides = []
  if (snap) {
    const xPoints = [x, x + frame.width / 2, x + frame.width]
    const yPoints = [y, y + frame.height / 2, y + frame.height]
    const xTargets = [...axisTargets(others, 'x', bounds.width), ...gridTargets(xPoints, options.gridSize)]
    const yTargets = [...axisTargets(others, 'y', bounds.height), ...gridTargets(yPoints, options.gridSize)]
    const sx = closestSnap(xPoints, xTargets, options.snapDistance)
    const sy = closestSnap(yPoints, yTargets, options.snapDistance)
    if (sx) { x = clamp(x + sx.delta, 0, bounds.width - frame.width); guides.push({ axis: 'x', value: sx.guide }) }
    if (sy) { y = clamp(y + sy.delta, 0, bounds.height - frame.height); guides.push({ axis: 'y', value: sy.guide }) }
  }
  return { frame: { ...frame, x: Math.round(x), y: Math.round(y) }, guides }
}

export function resizeFrame(frame, handle, delta, bounds, minimum = { width: 80, height: 50 }) {
  let { x, y, width, height } = frame
  const right = frame.x + frame.width
  const bottom = frame.y + frame.height
  if (handle.includes('e')) width = clamp(frame.width + delta.x, minimum.width, bounds.width - x)
  if (handle.includes('s')) height = clamp(frame.height + delta.y, minimum.height, bounds.height - y)
  if (handle.includes('w')) { x = clamp(frame.x + delta.x, 0, right - minimum.width); width = right - x }
  if (handle.includes('n')) { y = clamp(frame.y + delta.y, 0, bottom - minimum.height); height = bottom - y }
  return { ...frame, x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
}

export function resizeFrameWithSnapping(frame, handle, delta, bounds, minimum, others = [], snap = true, options = {}) {
  let resized = resizeFrame(frame, handle, delta, bounds, minimum)
  const guides = []
  if (!snap) return { frame: resized, guides }
  const xEdge = handle.includes('w') ? resized.x : handle.includes('e') ? resized.x + resized.width : null
  const yEdge = handle.includes('n') ? resized.y : handle.includes('s') ? resized.y + resized.height : null
  const sx = xEdge === null ? null : closestSnap([xEdge], axisTargets(others, 'x', bounds.width), options.snapDistance)
  const sy = yEdge === null ? null : closestSnap([yEdge], axisTargets(others, 'y', bounds.height), options.snapDistance)
  if (sx) { resized = resizeFrame(resized, handle, { x: sx.delta, y: 0 }, bounds, minimum); guides.push({ axis: 'x', value: sx.guide }) }
  if (sy) { resized = resizeFrame(resized, handle, { x: 0, y: sy.delta }, bounds, minimum); guides.push({ axis: 'y', value: sy.guide }) }
  return { frame: resized, guides }
}

export function chatShowcaseTarget(frame, bounds, margin = 70) {
  const left = Math.min(margin, Math.max(0, bounds.width - frame.width))
  const right = Math.max(0, bounds.width - frame.width - margin)
  const currentCentre = frame.x + frame.width / 2
  return { ...frame, x: Math.round(currentCentre < bounds.width / 2 ? right : left), y: Math.round(clamp(frame.y, 0, bounds.height - frame.height)) }
}

export function scaleLayout(widgets, from, to) {
  const sx = to.width / from.width; const sy = to.height / from.height
  return widgets.map((widget) => ({ ...widget, frame: { ...widget.frame, x: Math.round(widget.frame.x * sx), y: Math.round(widget.frame.y * sy), width: Math.round(widget.frame.width * sx), height: Math.round(widget.frame.height * sy) } }))
}
