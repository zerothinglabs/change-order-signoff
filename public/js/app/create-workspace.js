import { track } from '../shared/track.js'
import { state } from './state.js'
import { visitorId } from './visitor-id.js'

export function createWorkspace() {
  return fetch('api/workspace', { method: 'POST', headers: { 'content-type': 'application/json', 'x-zt-vid': visitorId() }, body: '{}' })
    .then((r) => {
      if (!r.ok) throw new Error('Could not create your dashboard. Try again.')

      return r.json()
    })
    .then((d) => {
      state.token = d.owner_token
      localStorage.setItem('ownerToken', state.token)
      track('workspace_created')
    })
}
