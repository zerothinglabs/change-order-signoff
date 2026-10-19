import type { Fonts } from '../pdf'
import { BOLD_FONT, KOREAN_JAPANESE_CHINESE_FONT, RARE_CHINESE_FONT, REGULAR_FONT } from './constants'

export const loadFonts = async (assets: Fetcher, requestUrl: string): Promise<Fonts> => {
  const get = async (file: string) => {
    const res = await assets.fetch(new Request(new URL(`/fonts/${file}`, requestUrl)))

    if (!res.ok) throw new Error(`font ${file}: ${res.status}`)

    return new Uint8Array(await res.arrayBuffer())
  }

  const [regular, bold] = await Promise.all([get(REGULAR_FONT), get(BOLD_FONT)])
  const fallbacks = () => Promise.all([get(KOREAN_JAPANESE_CHINESE_FONT), get(RARE_CHINESE_FONT)])

  return { regular, bold, fallbacks }
}
