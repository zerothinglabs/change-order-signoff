import type { Reply } from '../types'

export type PhotoReply = Reply<{ n: number } | { error: string }>
