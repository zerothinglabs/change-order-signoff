import { esc } from '../shared/esc.js'
import { state } from './state.js'

export function itemRow(it) {
  const n = ++state.rowSeq

  return '<div class="item"><div class="field desc"><label for="d' + n + '">Description</label><input id="d' + n + '" class="i-desc" maxlength="200" value="' + esc(it.desc) + '"></div>' +
    '<div class="field"><label for="q' + n + '">Qty</label><input id="q' + n + '" class="i-qty" inputmode="decimal" value="' + esc(it.qty) + '"></div>' +
    '<div class="field"><label for="u' + n + '">Unit price ($)</label><input id="u' + n + '" class="i-unit" inputmode="decimal" value="' + esc(it.unit) + '"></div>' +
    '<div class="line small"><span class="muted">Line total <span class="i-line num" data-zt-private></span></span><button class="btn-link small i-del" type="button">Remove line</button></div></div>'
}
