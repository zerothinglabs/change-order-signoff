import { track } from './track.js'

export function trackPageLeave() {
  if (document.visibilityState === 'hidden') track('page_left', { seconds: Math.round(performance.now() / 1000) })
}
