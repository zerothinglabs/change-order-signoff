import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { SOURCE_COOKIE } from './source-cookie'
import { sourceOf } from './source-of'

const THIRTY_DAYS = 30 * 86400

export const rememberSource = (c: Context) => {
  const source = sourceOf(c.req.header('referer'))

  if (source) setCookie(c, SOURCE_COOKIE, source, { path: '/', maxAge: THIRTY_DAYS, sameSite: 'Lax', secure: true, httpOnly: true })
}
