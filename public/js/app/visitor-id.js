export function visitorId() {
  let id = localStorage.getItem('zt_vid')

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('zt_vid', id)
  }

  return id
}
