import { track } from '../shared/track.js'
import { waitForPosthog } from './wait-for-posthog.js'

const POSTHOG_WAIT_MS = 1500

export function trackActivated() {
  if (sessionStorage.getItem('activated')) return Promise.resolve()

  return waitForPosthog(POSTHOG_WAIT_MS).then((sent) => Promise.resolve(track('activated')).then(() => {
    if (sent) sessionStorage.setItem('activated', '1')
  }))
}
