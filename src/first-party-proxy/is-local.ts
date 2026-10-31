import type { Context } from 'hono'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export const isLocal = (c: Context) => LOCAL_HOSTS.has(new URL(c.req.url).hostname)
