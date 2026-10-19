import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { INTERNAL_COOKIE } from './internal-cookie'

export const isInternal = (c: Context) =>
  getCookie(c, INTERNAL_COOKIE) === '1' || /HeadlessChrome/.test(c.req.header('user-agent') ?? '')
