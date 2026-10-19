import { esc } from '../shared/esc.js'
import { editableItems } from './editable-items.js'
import { itemRow } from './item-row.js'
import { jobPath } from './job-path.js'

export function coFormHtml(co, editing) {
  const existing = co.photo_count || 0

  return '<form class="stack" id="co-form" novalidate><p data-zt-private><a class="link" href="' + esc(jobPath(co.job_id)) + '">' + esc(co.job ? co.job.name : 'Job') + '</a></p>' +
    '<h1>' + (editing ? 'Edit change order #' + co.number : 'New change order') + '</h1>' +
    '<div class="field"><label for="c-title">Title</label><input id="c-title" maxlength="120" required placeholder="Add 4 recessed lights" value="' + esc(co.title) + '"></div>' +
    '<div class="field"><label for="c-desc">Description</label><textarea id="c-desc" class="short" maxlength="2000" placeholder="What changes, where, and why.">' + esc(co.description) + '</textarea></div>' +
    '<fieldset class="stack-sm bare"><legend class="small medium mb-8">Line items. Use a negative unit price for a credit.</legend>' +
    '<div class="items" id="items">' + editableItems(co).map(itemRow).join('') + '</div>' +
    '<div><button class="btn btn-outline btn-sm" type="button" id="add-item">Add line</button></div></fieldset>' +
    '<div class="total-bar"><span>Change order total</span><span class="num" id="total" aria-live="polite" data-zt-private></span></div>' +
    '<div class="grid-2"><div class="field"><label for="c-days">Schedule impact (days)</label><input id="c-days" type="number" min="-365" max="365" step="1" value="' + esc(co.days_impact || 0) + '"><span class="hint">Negative if it saves time.</span></div>' +
    '<div class="field"><label for="c-terms">Payment terms (optional)</label><input id="c-terms" maxlength="200" placeholder="Due with the next progress payment" value="' + esc(co.payment_terms) + '"></div></div>' +
    '<div class="field"><label for="c-photos">Photos (up to ' + (4 - existing) + ' more)</label><input id="c-photos" type="file" accept="image/*" multiple' + (existing >= 4 ? ' disabled' : '') + '>' +
    '<span class="hint">' + (existing ? existing + ' already attached. ' : '') + 'Photos are resized on your phone before upload.</span><div class="photos ph-no-capture" id="previews" data-zt-private></div></div>' +
    '<div id="form-msg"></div>' +
    '<div class="row"><button class="btn" type="submit" data-send="1">Save &amp; get signing link</button><button class="btn btn-outline" type="submit" data-send="0">Save draft</button></div></form>'
}
