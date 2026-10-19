import { track } from '../shared/track.js'
import { copyText } from './copy-text.js'
import { deleteDraft } from './delete-draft.js'
import { onClick } from './on-click.js'
import { sendDraft } from './send-draft.js'
import { voidCo } from './void-co.js'

export function wireCoActions(co, link) {
  const msg = document.getElementById('co-msg')

  onClick('send', (e) => sendDraft(e, co, msg))
  onClick('del', () => deleteDraft(co, msg))
  onClick('void', () => voidCo(co, msg))
  onClick('copy-link', (e) => {
    copyText(link, e.target)
    track('co_link_shared', { channel: 'copy' })
  })
  onClick('sms-link', () => track('co_link_shared', { channel: 'sms' }))
  onClick('mail-link', () => track('co_link_shared', { channel: 'email' }))
  onClick('pdf', () => track('pdf_downloaded', { by: 'contractor' }))
}
