const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => entities[c])
}
