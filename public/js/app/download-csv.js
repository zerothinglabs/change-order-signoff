import { track } from '../shared/track.js'

export function downloadCsv(job, blob) {
  const a = document.createElement('a')

  a.href = URL.createObjectURL(blob)
  a.download = (job.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'job') + '-change-orders.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  track('csv_exported')
}
