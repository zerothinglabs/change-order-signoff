const token = location.pathname.split('/').filter(Boolean).pop()

export const signEndpoint = '../api/sign/' + encodeURIComponent(token)
