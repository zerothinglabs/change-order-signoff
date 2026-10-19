import { esc } from '../shared/esc.js'
import { money } from '../shared/money.js'
import { jobPath } from './job-path.js'

export function jobsListHtml(jobs) {
  return '<ul class="jobs" data-zt-private>' + jobs.map((j) =>
    '<li><a href="' + esc(jobPath(j.id)) + '"><div class="spread"><span class="name">' + esc(j.name) + '</span><span class="num">' + money(j.current_total_cents) + '</span></div>' +
    '<div class="spread small muted"><span>' + esc(j.client_name) + '</span><span>' + (j.pending_count ? j.pending_count + ' waiting for signature' : 'Nothing pending') + '</span></div></a></li>',
  ).join('') + '</ul>'
}
