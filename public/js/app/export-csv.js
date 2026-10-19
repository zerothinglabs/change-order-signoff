import { api } from './api.js'
import { downloadCsv } from './download-csv.js'
import { fail } from './fail.js'
import { state } from './state.js'
import { upgradeLink } from './upgrade-link.js'

export function exportCsv(job) {
  const msg = document.getElementById('csv-msg')

  if (!state.ws.paid) {
    msg.innerHTML = '<div class="notice spread"><p>CSV export is part of Pro.</p>' + upgradeLink('csv') + '</div>'

    return
  }

  api('api/jobs/' + encodeURIComponent(job.id) + '/export.csv', { raw: true }).then((r) => {
    if (r.status === 402) {
      state.ws.paid = false

      return exportCsv(job)
    }

    if (!r.ok) throw new Error('Export failed. Try again.')

    return r.blob().then((b) => downloadCsv(job, b))
  }).catch((err) => fail(msg, err))
}
