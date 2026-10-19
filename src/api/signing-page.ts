import type { Context } from 'hono'
import type { Env } from '../types'

export const signingPage = (c: Context<Env>) => c.env.ASSETS.fetch(new Request(new URL('/s/', c.req.url)))
