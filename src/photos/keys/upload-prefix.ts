import { randomToken } from '../../lib'

export const uploadPrefix = (coId: string, uploadId: string | null | undefined) => `photo/${coId}/u-${uploadId ?? randomToken(12)}.`
