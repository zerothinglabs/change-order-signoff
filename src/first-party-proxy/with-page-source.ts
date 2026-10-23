import { z } from 'zod'

const Beacon = z.looseObject({ referrer: z.string().optional() })

const sourceOf = (pageUrl: string) => {
  const params = URL.canParse(pageUrl) ? new URL(pageUrl).searchParams : new URLSearchParams()

  return params.get('ref') || params.get('utm_source')
}

export const withPageSource = (body: string, pageUrl = '') => {
  const source = sourceOf(pageUrl)

  if (!source) return body

  try {
    return JSON.stringify({ ...Beacon.parse(JSON.parse(body)), referrer: source })
  } catch {
    return body
  }
}
