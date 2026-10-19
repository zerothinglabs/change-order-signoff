import { esc } from '../shared/esc.js'
import { coPath } from './co-path.js'

export function draftActionsHtml(co) {
  return '<div class="row"><button class="btn" type="button" id="send">Get signing link</button><a class="btn btn-outline" href="' + esc(coPath(co.id)) + '?edit=1">Edit</a>' +
    '<button class="btn btn-danger" type="button" id="del">Delete</button></div>'
}
