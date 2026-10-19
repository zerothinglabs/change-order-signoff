export function errorMessage(err) {
  if (!err || !err.message) return 'Something went wrong. Try again.'
  if (err.message === 'Failed to fetch') return 'No connection. Check your signal and try again.'
  if (err.code === 'not_found') return 'Not found. It may have been deleted.'
  if (err.code === 'locked') return 'This change order was already sent, so it can no longer change.'
  if (err.code === 'uploading') return 'A photo is still uploading. Wait for it to finish, then send.'
  if (err.code === 'changed') return 'This draft changed while it was being sent. Check it and send again.'

  return err.message
}
