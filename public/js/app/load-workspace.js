import { api } from './api.js'
import { state } from './state.js'

export function loadWorkspace() {
  return api('api/workspace').then((d) => { state.ws = d })
}
