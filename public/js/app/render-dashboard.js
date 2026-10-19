import { dashboardHtml } from './dashboard-html.js'
import { loadJobs } from './load-jobs.js'
import { show } from './show.js'
import { wireJobForm } from './wire-job-form.js'
import { wirePrivateLink } from './wire-private-link.js'
import { wireProfile } from './wire-profile.js'

export function renderDashboard() {
  show(dashboardHtml())
  wireJobForm()
  wireProfile()
  wirePrivateLink()
  loadJobs()
}
