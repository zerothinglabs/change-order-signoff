import { renderCo } from './render-co.js'
import { renderDashboard } from './render-dashboard.js'
import { renderForm } from './render-form.js'
import { renderJob } from './render-job.js'

export function route() {
  const m = /\/app\/(job|co)\/([^/]+)$/.exec(location.pathname)
  const q = new URLSearchParams(location.search)
  const id = m && decodeURIComponent(m[2])

  if (m && m[1] === 'job') return renderJob(id)
  if (m && id === 'new' && q.get('job')) return renderForm(q.get('job'), null)
  if (m && id !== 'new' && q.get('edit')) return renderForm(null, id)
  if (m && id !== 'new') return renderCo(id)

  renderDashboard()
}
