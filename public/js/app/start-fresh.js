import { absoluteUrl } from './absolute-url.js'
import { createWorkspace } from './create-workspace.js'
import { start } from './start.js'
import { state } from './state.js'

export function startFresh() {
  localStorage.removeItem('ownerToken')
  state.token = null

  const pathHoldsOldWorkspaceIds = !location.pathname.endsWith('/app')

  if (pathHoldsOldWorkspaceIds) history.replaceState(null, '', absoluteUrl('app'))

  start(createWorkspace())
}
