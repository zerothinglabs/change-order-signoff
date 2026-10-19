import { requestError } from './request-error.js'
import { state } from './state.js'
import { visitorId } from './visitor-id.js'

export function api(path, opts = {}) {
  const headers = { authorization: 'Bearer ' + state.token, 'x-zt-vid': visitorId() }
  let body = opts.form

  if (opts.json !== undefined) {
    headers['content-type'] = 'application/json'
    body = JSON.stringify(opts.json)
  }

  return fetch(path, { method: opts.method || (body ? 'POST' : 'GET'), headers, body }).then((res) => {
    if (opts.raw) return res

    const isJson = (res.headers.get('content-type') || '').includes('json')

    return (isJson ? res.json() : Promise.resolve(null)).then((data) => {
      if (!res.ok) throw requestError(res, data)

      return data
    })
  })
}
