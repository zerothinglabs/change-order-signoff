import app from '../../src/index'
import { state } from './state'

type Opts = { method?: string; token?: string | null; body?: unknown; form?: FormData; headers?: Record<string, string> }

export async function call(path: string, o: Opts = {}) {
  const headers: Record<string, string> = { 'x-zt-vid': 'vid-1', ...o.headers }

  if (o.token) headers.authorization = `Bearer ${o.token}`

  let body: BodyInit | undefined

  if (o.form) body = o.form
  else if (o.body !== undefined) {
    body = JSON.stringify(o.body)
    headers['content-type'] = 'application/json'
  }

  return app.request(path, { method: o.method ?? (body ? 'POST' : 'GET'), headers, body }, state.env)
}
