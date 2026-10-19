const MISSING_GLYPH = '?'
const FIRST_PRINTABLE = 0x20

export const replaceMissingGlyphs = (text: string, drawable: Set<number>): string => {
  let out = ''

  for (const ch of text.normalize('NFC').replace(/\t/g, ' ')) {
    const cp = ch.codePointAt(0)!

    out += ch === '\n' || drawable.has(cp) ? ch : cp < FIRST_PRINTABLE ? '' : MISSING_GLYPH
  }

  return out
}
