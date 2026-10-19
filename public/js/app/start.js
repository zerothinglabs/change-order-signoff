import { brokenLinkHtml } from './broken-link-html.js'
import { fail } from './fail.js'
import { loadWorkspace } from './load-workspace.js'
import { route } from './route.js'
import { show } from './show.js'
import { startFresh } from './start-fresh.js'
import { view } from './view.js'

export function start(ready) {
  ready.then(loadWorkspace).then(route).catch((err) => {
    if (err.status !== 401) return fail(view, err)

    show(brokenLinkHtml)
    document.getElementById('fresh').onclick = startFresh
  })
}
