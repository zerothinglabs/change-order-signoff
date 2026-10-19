import type { Context } from 'hono'
import type { Env } from '../types'
import { workspaceView } from '../workspace'

export const getWorkspace = async (c: Context<Env>) => c.json(await workspaceView(c.env, c.get('ws'), c.req.header('x-zt-vid')))
