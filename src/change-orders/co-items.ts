import type { Item } from '../lib'
import type { ChangeOrder } from '../types'

export const coItems = (co: ChangeOrder) => JSON.parse(co.items_json) as Item[]
