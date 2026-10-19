import { decidedActionsHtml } from './decided-actions-html.js'
import { draftActionsHtml } from './draft-actions-html.js'
import { sentActionsHtml } from './sent-actions-html.js'

export function coActionsHtml(co, link) {
  if (co.status === 'draft') return draftActionsHtml(co)
  if (co.status === 'sent') return sentActionsHtml(co, link)
  if (co.status === 'approved' || co.status === 'declined') return decidedActionsHtml(co)
  if (co.status === 'void') return '<p class="notice">Withdrawn. The signing link now tells your customer this change order was withdrawn.</p>'

  return ''
}
