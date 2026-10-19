import { api } from './api.js'
import { fail } from './fail.js'
import { jobPath } from './job-path.js'
import { navigate } from './navigate.js'

export function deleteDraft(co, msg) {
  if (!confirm('Delete this draft? This cannot be undone.')) return

  api('api/co/' + encodeURIComponent(co.id), { method: 'DELETE', raw: true }).then((r) => {
    if (r.status !== 204) throw new Error('Could not delete. Only drafts can be deleted.')

    navigate(jobPath(co.job_id))
  }).catch((err) => fail(msg, err))
}
