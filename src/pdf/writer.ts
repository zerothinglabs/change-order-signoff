import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb } from 'pdf-lib'
import { MARGIN, PAGE_HEIGHT, PAGE_WIDTH } from './constants'
import { replaceMissingGlyphs, toFace } from './fonts'
import type { Cell, Face } from './types'

export class Writer {
  page!: PDFPage
  y = 0
  chars: Set<number>
  private faces = new Map<PDFFont, Face>()

  constructor(private doc: PDFDocument, private font: PDFFont, private bold: PDFFont, private fallbacks: Face[]) {
    for (const f of [font, bold]) this.faces.set(f, toFace(f))
    this.chars = new Set([this.faces.get(font)!.chars, ...fallbacks.map((f) => f.chars)].flatMap((c) => [...c]))
    this.newPage()
  }

  singleFontRuns(text: string, font: PDFFont): { t: string; font: PDFFont }[] {
    const mainThenFallbacks = [this.faces.get(font)!, ...this.fallbacks]
    const out: { t: string; font: PDFFont }[] = []

    for (const ch of text) {
      const cp = ch.codePointAt(0)!
      const f = (mainThenFallbacks.find((o) => o.chars.has(cp)) ?? mainThenFallbacks[0]!).font
      const last = out[out.length - 1]

      if (last?.font === f) last.t += ch
      else out.push({ t: ch, font: f })
    }

    return out
  }

  width(text: string, size: number, font: PDFFont): number {
    return this.singleFontRuns(text, font).reduce((sum, r) => sum + r.font.widthOfTextAtSize(r.t, size), 0)
  }

  draw(text: string, x: number, y: number, size: number, font: PDFFont) {
    for (const r of this.singleFontRuns(text, font)) {
      this.page.drawText(r.t, { x, y, size, font: r.font, color: rgb(0.07, 0.07, 0.08) })
      x += r.font.widthOfTextAtSize(r.t, size)
    }
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    this.y = PAGE_HEIGHT - MARGIN
  }

  need(h: number) {
    if (this.y - h < MARGIN) this.newPage()
  }

  wrap(text: string, size: number, width: number, font = this.font): string[] {
    const lines: string[] = []

    for (const para of replaceMissingGlyphs(text, this.chars).split('\n')) {
      let line = ''

      for (const word of para.split(/ +/)) {
        let unspacedRun = word

        while (this.width(unspacedRun, size, font) > width) {
          const chars = [...unspacedRun]
          let i = chars.length - 1

          while (i > 1 && this.width(chars.slice(0, i).join(''), size, font) > width) i--

          if (line) { lines.push(line); line = '' }

          lines.push(chars.slice(0, i).join(''))
          unspacedRun = chars.slice(i).join('')
        }

        const next = line ? line + ' ' + unspacedRun : unspacedRun

        if (this.width(next, size, font) > width && line) {
          lines.push(line)
          line = unspacedRun
        } else line = next
      }

      lines.push(line)
    }

    return lines
  }

  text(text: string, opts: { size?: number; bold?: boolean; x?: number; width?: number; gap?: number } = {}) {
    const size = opts.size ?? 10
    const font = opts.bold ? this.bold : this.font
    const x = opts.x ?? MARGIN
    const lh = size * 1.35

    for (const line of this.wrap(text, size, opts.width ?? PAGE_WIDTH - MARGIN - x, font)) {
      this.need(lh)
      this.y -= lh
      this.draw(line, x, this.y + size * 0.25, size, font)
    }

    this.y -= opts.gap ?? 4
  }

  row(cells: Cell[], bold = false, size = 10) {
    const font = bold ? this.bold : this.font
    const lh = size * 1.35
    const wrapped = cells.map((c) => this.wrap(c.t, size, c.w, font))
    const n = Math.max(...wrapped.map((l) => l.length))

    this.need(n * lh + 4)
    wrapped.forEach((lines, i) => {
      const c = cells[i]!

      lines.forEach((line, j) => {
        const x = c.right ? c.x + c.w - this.width(line, size, font) : c.x

        this.draw(line, x, this.y - (j + 1) * lh + size * 0.25, size, font)
      })
    })
    this.y -= n * lh + 4
  }

  rule() {
    this.need(8)
    this.y -= 4
    this.page.drawLine({
      start: { x: MARGIN, y: this.y }, end: { x: PAGE_WIDTH - MARGIN, y: this.y }, thickness: 0.5, color: rgb(0.75, 0.75, 0.78),
    })
    this.y -= 6
  }

  image(img: PDFImage, maxW: number, maxH: number) {
    const s = Math.min(maxW / img.width, maxH / img.height, 1)
    const w = img.width * s
    const h = img.height * s

    this.need(h + 8)
    this.y -= h
    this.page.drawImage(img, { x: MARGIN, y: this.y, width: w, height: h })
    this.y -= 8
  }
}
