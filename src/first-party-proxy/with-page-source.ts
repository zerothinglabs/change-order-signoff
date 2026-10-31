import { z } from 'zod'

const Beacon = z.looseObject({ referrer: z.string().optional() })

export const withPageSource = (body: string, source: string | null) => {
  if (!source) return body

  try {
    return JSON.stringify({ ...Beacon.parse(JSON.parse(body)), referrer: source })
  } catch {
    return body
  }
}
