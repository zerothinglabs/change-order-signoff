export function padPoint(canvas, e) {
  const r = canvas.getBoundingClientRect()

  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]
}
