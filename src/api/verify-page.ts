import type { Context } from 'hono'
import type { Env } from '../types'

export const verifyPage = (c: Context<Env>) => c.env.ASSETS.fetch(new Request(new URL('/verify/', c.req.url)))
