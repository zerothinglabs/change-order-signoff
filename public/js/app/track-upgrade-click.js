import { track } from '../shared/track.js'

export function trackUpgradeClick(e) {
  const a = e.target.closest?.('[data-upgrade]')

  if (a) track('upgrade_clicked', { from: a.getAttribute('data-upgrade') })
}
