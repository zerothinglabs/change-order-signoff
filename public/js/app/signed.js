import { money } from '../shared/money.js'

export function signed(cents) {
  return (cents > 0 ? '+' : '') + money(cents)
}
