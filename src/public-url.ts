const SAME_HOST_PATH = /^\/[A-Za-z0-9._~/-]*$/

export const publicUrl = (req: Request, path: string) => {
  const dispatchPrefix = req.headers.get('x-zt-base') ?? ''
  const prefix = SAME_HOST_PATH.test(dispatchPrefix) ? dispatchPrefix.replace(/\/+$/, '') : ''

  return `${new URL(req.url).origin}${prefix}/${path}`
}
