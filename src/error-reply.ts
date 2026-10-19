import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Reply } from './types'

export const errorReply = (status: ContentfulStatusCode, error: string): Reply<{ error: string }> => ({ status, body: { error } })
