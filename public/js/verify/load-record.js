export function loadRecord(token) {
  return fetch('../api/verify/' + encodeURIComponent(token)).then((r) => {
    if (r.status === 404) throw new Error('There is no signed record for this link. Check that you copied the whole link.')
    if (!r.ok) throw new Error('Could not load the record. Try again.')

    return r.json()
  })
}
