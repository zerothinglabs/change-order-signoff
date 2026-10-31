import { randomToken } from '../../lib'

export const photoKey = (prefix: string) => `${prefix}${randomToken(12)}.jpg`
