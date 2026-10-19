import { drawPad } from './draw-pad.js'
import { exportPadPng } from './export-pad-png.js'
import { padPoint } from './pad-point.js'

export function makePad(canvas, onChange) {
  const ctx = canvas.getContext('2d')
  const pad = { strokes: [], typedName: null }
  let current = null
  let lastWidth = 0

  const redraw = () => drawPad(ctx, canvas.width, canvas.height, pad)

  const size = () => {
    const r = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    redraw()
  }

  const endStroke = () => { current = null }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    canvas.setPointerCapture(e.pointerId)
    current = [padPoint(canvas, e)]
    pad.strokes.push(current)
    redraw()
    onChange()
  })

  canvas.addEventListener('pointermove', (e) => {
    if (!current) return

    current.push(padPoint(canvas, e))
    redraw()
  })

  canvas.addEventListener('pointerup', endStroke)
  canvas.addEventListener('pointercancel', endStroke)

  window.addEventListener('resize', () => {
    const w = canvas.getBoundingClientRect().width

    if (w !== lastWidth) {
      lastWidth = w
      size()
    }
  })

  size()
  lastWidth = canvas.getBoundingClientRect().width

  return {
    strokes: () => pad.strokes.length + (pad.typedName ? 1 : 0),
    clear: () => {
      pad.strokes = []
      pad.typedName = null
      redraw()
    },
    typed: (name) => {
      pad.strokes = []
      pad.typedName = name
      redraw()
    },
    png: () => exportPadPng(canvas, pad),
  }
}
