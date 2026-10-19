import type { Context } from 'hono'
import type { Env } from '../types'
import { insertWorkspace } from '../workspace'

export const createWorkspace = async (c: Context<Env>) => c.json(await insertWorkspace(c.env.DB, c.req.header('x-zt-vid')), 201)
