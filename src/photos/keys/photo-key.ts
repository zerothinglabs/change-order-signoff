import { randomToken } from '../../lib'

export const photoKey = (coId: string, uploadId: string | null | undefined) => `photo/${coId}/${uploadId ? `u-${uploadId}` : randomToken(12)}.jpg`
