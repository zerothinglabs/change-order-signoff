import { api } from './api.js'
import { coPath } from './co-path.js'
import { drawForm } from './draw-form.js'
import { fail } from './fail.js'
import { navigate } from './navigate.js'
import { show } from './show.js'
import { view } from './view.js'

export function renderForm(jobId, coId) {
  show('<p class="muted">Loading.</p>')

  const load = coId ? api('api/co/' + encodeURIComponent(coId)) : api('api/jobs/' + encodeURIComponent(jobId)).then((d) => ({ job: d.job, job_id: d.job.id }))

  load.then((co) => {
    if (coId && co.status !== 'draft') return navigate(coPath(coId))

    drawForm(co, Boolean(coId))
  }).catch((err) => fail(view, err))
}
