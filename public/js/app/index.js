import { createWorkspace } from './create-workspace.js'
import { start } from './start.js'
import { state } from './state.js'
import { trackUpgradeClick } from './track-upgrade-click.js'

document.addEventListener('click', trackUpgradeClick)

state.token = localStorage.getItem('ownerToken')
start(state.token ? Promise.resolve() : createWorkspace())
