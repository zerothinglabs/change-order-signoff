import { createWorkspace } from './create-workspace.js'
import { start } from './start.js'
import { state } from './state.js'
import { trackUpgradeClick } from './track-upgrade-click.js'

document.addEventListener('click', trackUpgradeClick)

const ownerLink = /^#k=([A-Za-z0-9_-]{20,})/.exec(location.hash)

if (ownerLink) {
  localStorage.setItem('ownerToken', ownerLink[1])
  history.replaceState(null, '', location.pathname + location.search)
}

state.token = localStorage.getItem('ownerToken')
start(state.token ? Promise.resolve() : createWorkspace())
