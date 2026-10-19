import { UTCDate } from '@date-fns/utc'
import { addMonths, startOfMonth } from 'date-fns'

export const utcMonthRange = (now = new Date()): [string, string] => {
  const start = startOfMonth(new UTCDate(now))

  return [start.toISOString(), addMonths(start, 1).toISOString()]
}
