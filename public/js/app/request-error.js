export function requestError(res, data) {
  const err = new Error(data?.error || 'Request failed (' + res.status + ').')

  err.status = res.status
  err.code = data?.error

  return err
}
