import { money } from '../shared/money.js'

export function signedAmount(cents) {
  return (cents >= 0 ? '+' : '') + money(cents)
}
