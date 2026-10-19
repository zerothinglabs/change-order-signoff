import { esc } from './esc.js'

export function errorNotice(text) {
  return '<p class="notice error" role="alert">' + esc(text) + '</p>'
}
