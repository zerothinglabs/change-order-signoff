import { encode } from 'jpeg-js'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it, vi } from 'vitest'
import { isValidPng, jpegOk } from '../src/lib'
import { blankPng } from './env'

const IHDR_END = 33

const grayJpeg = (width: number, height: number) =>
  new Uint8Array(encode({ width, height, data: new Uint8Array(width * height * 4).fill(128) }, 80).data)

describe('image checks', () => {
  it('rejects a PNG whose second IHDR is over the size limit, without decoding it', async () => {
    const small = blankPng(1, 1)
    const wide = blankPng(4001, 1)
    const smallIhdrThenWide = new Uint8Array([...wide.subarray(0, 8), ...small.subarray(8, IHDR_END), ...wide.subarray(8)])
    const embedPng = vi.spyOn(PDFDocument.prototype, 'embedPng')

    expect(await isValidPng(smallIhdrThenWide)).toBe(false)
    expect(embedPng).not.toHaveBeenCalled()
    expect(await isValidPng(small)).toBe(true)
    expect(embedPng).toHaveBeenCalledTimes(1)
    embedPng.mockRestore()
  })

  it('rejects a PNG with a broken chunk CRC or bytes after IEND', async () => {
    const png = blankPng(10, 10)
    const badCrc = png.slice()

    badCrc[IHDR_END - 1]! ^= 0xff

    expect(await isValidPng(badCrc)).toBe(false)
    expect(await isValidPng(new Uint8Array([...png, 0]))).toBe(false)
    expect(await isValidPng(png)).toBe(true)
  })

  it('accepts a JPEG up to 1600 px per side, the size the app resizes photos to, and rejects a larger one', () => {
    expect(jpegOk(grayJpeg(1600, 1600))).toEqual({ width: 1600, height: 1600 })
    expect(jpegOk(grayJpeg(1601, 1600))).toBeNull()
    expect(jpegOk(grayJpeg(1601, 10))).toBeNull()
  })
})
