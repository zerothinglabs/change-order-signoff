export function onClick(id, handler) {
  const el = document.getElementById(id)

  if (el) el.onclick = handler
}
