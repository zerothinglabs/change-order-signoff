import type { Context } from 'hono'
import { appShell } from '../app-shell'
import type { Env } from '../types'

export const appPage = (c: Context<Env>) => appShell(c.env.ASSETS, c.req.url)
