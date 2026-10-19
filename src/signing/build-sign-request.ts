import { publicUrl } from '../public-url'
import { MAX_USER_AGENT_LENGTH } from './constants'
import type { SignableRow, SignRequest } from './types'

export const buildSignRequest = (row: SignableRow, body: SignRequest['body'], token: string, request: Request): SignRequest => ({
  row,
  body,
  token,
  ip: request.headers.get('cf-connecting-ip') ?? '',
  userAgent: (request.headers.get('user-agent') ?? '').slice(0, MAX_USER_AGENT_LENGTH),
  requestUrl: request.url,
  verifyUrl: publicUrl(request, `verify/${token}`),
})
