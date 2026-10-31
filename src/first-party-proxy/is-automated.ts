import type { Context } from 'hono'
import { isbot } from 'isbot'

export const isAutomated = (c: Context) => {
  const agent = c.req.header('user-agent')

  return !agent || isbot(agent)
}
