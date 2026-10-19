import { now } from '../now'
import type { ChangeOrder } from '../types'

export const uploadInFlight = (co: ChangeOrder): boolean => co.uploading > 0 && !!co.uploading_until && co.uploading_until > now()
