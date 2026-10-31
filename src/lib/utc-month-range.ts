import { UTCDate } from '@date-fns/utc'
import { addMonths } from 'date-fns/addMonths'
import { startOfMonth } from 'date-fns/startOfMonth'

export const utcMonthRange = (now = new Date()): [string, string] => {
  const start = startOfMonth(new UTCDate(now))

  return [start.toISOString(), addMonths(start, 1).toISOString()]
}
