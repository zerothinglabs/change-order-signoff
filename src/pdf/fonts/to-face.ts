import type { PDFFont } from 'pdf-lib'
import type { Face } from '../types'

export const toFace = (font: PDFFont): Face => ({ font, chars: new Set(font.getCharacterSet()) })
