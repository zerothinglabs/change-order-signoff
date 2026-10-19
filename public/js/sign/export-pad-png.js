import { drawPad } from './draw-pad.js'

const EXPORT_WIDTH_KEEPS_PNG_UNDER_200_KB = 600

export function exportPadPng(canvas, pad) {
  const r = canvas.getBoundingClientRect()
  const out = document.createElement('canvas')

  out.width = EXPORT_WIDTH_KEEPS_PNG_UNDER_200_KB
  out.height = Math.round(EXPORT_WIDTH_KEEPS_PNG_UNDER_200_KB * (r.height / r.width))

  const c = out.getContext('2d')

  drawPad(c, out.width, out.height, pad)
  c.globalCompositeOperation = 'destination-over'
  c.fillStyle = '#fff'
  c.fillRect(0, 0, out.width, out.height)

  return out.toDataURL('image/png')
}
