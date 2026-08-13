export const SNAP_DISTANCE = 10

export function clamp(value, min, max) { return Math.min(max, Math.max(min, value)) }

export function editorScale(canvasWidth, canvasHeight, availableWidth, availableHeight) {
  if (![canvasWidth, canvasHeight, availableWidth, availableHeight].every((value) => Number(value) > 0)) return 1
  return Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight, 1)
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

function snapValue(value, candidates, distance = SNAP_DISTANCE) {
  let result = value
  let guide = null
  for (const candidate of candidates) {
    if (Math.abs(value - candidate) <= distance) { result = candidate; guide = candidate; break }
  }
  return { value: result, guide }
}

export function moveFrame(frame, delta, bounds, others = [], snap = true) {
  let x = clamp(frame.x + delta.x, 0, Math.max(0, bounds.width - frame.width))
  let y = clamp(frame.y + delta.y, 0, Math.max(0, bounds.height - frame.height))
  const guides = []
  if (snap) {
    const xCandidates = [0, bounds.width / 2 - frame.width / 2, bounds.width - frame.width]
    const yCandidates = [0, bounds.height / 2 - frame.height / 2, bounds.height - frame.height]
    for (const other of others) {
      xCandidates.push(other.x, other.x + other.width, other.x - frame.width, other.x + other.width - frame.width)
      yCandidates.push(other.y, other.y + other.height, other.y - frame.height, other.y + other.height - frame.height)
    }
    const sx = snapValue(x, xCandidates)
    const sy = snapValue(y, yCandidates)
    x = sx.value; y = sy.value
    if (sx.guide !== null) guides.push({ axis: 'x', value: sx.guide })
    if (sy.guide !== null) guides.push({ axis: 'y', value: sy.guide })
  }
  return { frame: { ...frame, x: Math.round(x), y: Math.round(y) }, guides }
}

export function resizeFrame(frame, handle, delta, bounds, minimum = { width: 80, height: 50 }) {
  let { x, y, width, height } = frame
  if (handle.includes('e')) width += delta.x
  if (handle.includes('s')) height += delta.y
  if (handle.includes('w')) { x += delta.x; width -= delta.x }
  if (handle.includes('n')) { y += delta.y; height -= delta.y }
  if (width < minimum.width) { if (handle.includes('w')) x -= minimum.width - width; width = minimum.width }
  if (height < minimum.height) { if (handle.includes('n')) y -= minimum.height - height; height = minimum.height }
  x = clamp(x, 0, bounds.width - minimum.width); y = clamp(y, 0, bounds.height - minimum.height)
  width = clamp(width, minimum.width, bounds.width - x); height = clamp(height, minimum.height, bounds.height - y)
  return { ...frame, x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
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
