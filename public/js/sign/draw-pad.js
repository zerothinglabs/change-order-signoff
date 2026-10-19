const INK = '#18181b'
const TYPED_FONT = '"Snell Roundhand", "Segoe Script", "Brush Script MT", cursive, serif'

export function drawPad(c, w, h, pad) {
  c.clearRect(0, 0, w, h)
  c.strokeStyle = c.fillStyle = INK
  c.lineWidth = Math.max(2, w / 220)
  c.lineCap = c.lineJoin = 'round'

  if (pad.typedName) {
    c.font = 'italic ' + Math.round(h * 0.32) + 'px ' + TYPED_FONT
    c.textBaseline = 'alphabetic'
    c.fillText(pad.typedName, w * 0.1, h * 0.7, w * 0.85)
  }

  pad.strokes.forEach((s) => {
    c.beginPath()
    c.moveTo(s[0][0] * w, s[0][1] * h)

    if (s.length === 1) c.lineTo(s[0][0] * w + 0.5, s[0][1] * h + 0.5)

    for (let i = 1; i < s.length; i++) c.lineTo(s[i][0] * w, s[i][1] * h)

    c.stroke()
  })
}
