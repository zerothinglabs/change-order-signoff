import { jobFormHtml } from './job-form-html.js'
import { privateLinkCard } from './private-link-card.js'
import { profileCard } from './profile-card.js'
import { usageLine } from './usage-line.js'

export function dashboardHtml() {
  return '<div class="stack"><div class="spread"><h1>Jobs</h1><button class="btn" type="button" id="new-job">New job</button></div>' +
    '<div class="notice" id="usage">' + usageLine() + '</div>' +
    jobFormHtml +
    '<div id="jobs"><p class="muted">Loading jobs.</p></div>' +
    profileCard() + privateLinkCard() + '</div>'
}
