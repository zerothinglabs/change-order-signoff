import { z } from 'zod'
import { sourceOf } from './source-of'

const Beacon = z.looseObject({ referrer: z.string().optional() })

export const withPageSource = (body: string, pageUrl = '') => {
  const source = sourceOf(pageUrl)

  if (!source) return body

  try {
    return JSON.stringify({ ...Beacon.parse(JSON.parse(body)), referrer: source })
  } catch {
    return body
  }
}
