import { api } from './api.js'
import { exportCsv } from './export-csv.js'
import { fail } from './fail.js'
import { jobHtml } from './job-html.js'
import { show } from './show.js'
import { view } from './view.js'

export function renderJob(id) {
  show('<p class="muted">Loading job.</p>')
  api('api/jobs/' + encodeURIComponent(id)).then((d) => {
    show(jobHtml(d))
    document.getElementById('csv').onclick = () => exportCsv(d.job)
  }).catch((err) => fail(view, err))
}
