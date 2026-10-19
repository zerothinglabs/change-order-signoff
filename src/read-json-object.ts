import type { HonoRequest } from 'hono'
import { z } from 'zod'

const JsonObject = z.record(z.string(), z.unknown())

export const readJsonObject = async (req: HonoRequest) => {
  const parsed = JsonObject.safeParse(await req.json<unknown>().catch(() => null))

  return parsed.success ? parsed.data : null
}
