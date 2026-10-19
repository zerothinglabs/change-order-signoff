import { track } from '../shared/track.js'

export function wirePdf() {
  const a = document.getElementById('pdf')

  if (a) a.onclick = () => track('pdf_downloaded', { by: 'client' })
}
