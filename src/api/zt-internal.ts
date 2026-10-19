import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { INTERNAL_COOKIE } from '../first-party-proxy/internal-cookie'
import { internalPage } from '../first-party-proxy/internal-page'
import type { Env } from '../types'

export const ztInternal = (c: Context<Env>) => {
  const on = c.req.query('off') !== '1'

  if (on) setCookie(c, INTERNAL_COOKIE, '1', { path: '/', maxAge: 400 * 86400, sameSite: 'Lax', secure: true, httpOnly: true })
  else deleteCookie(c, INTERNAL_COOKIE, { path: '/', secure: true })

  c.header('cache-control', 'no-store')

  return c.html(internalPage(on))
}
