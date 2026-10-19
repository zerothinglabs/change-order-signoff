import { api } from './api.js'
import { fail } from './fail.js'
import { jobsListHtml } from './jobs-list-html.js'

export function loadJobs() {
  const el = document.getElementById('jobs')

  api('api/jobs').then((jobs) => {
    el.innerHTML = jobs.length ? jobsListHtml(jobs) : '<p class="muted">No jobs yet. Add one, then write its first change order.</p>'
  }).catch((err) => fail(el, err))
}
