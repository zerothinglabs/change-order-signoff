import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { SOURCE_COOKIE } from './source-cookie'
import { sourceOf } from './source-of'

export const pageSource = (c: Context) => sourceOf(c.req.header('referer')) || getCookie(c, SOURCE_COOKIE) || null
