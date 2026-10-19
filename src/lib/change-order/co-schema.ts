import { z } from 'zod'
import { MAX_ITEMS } from '../constants'

const TITLE_ERROR = 'Title is required (up to 120 characters).'
const DESCRIPTION_ERROR = 'Description is too long (up to 2000 characters).'
const ITEMS_ERROR = `Add 1 to ${MAX_ITEMS} line items.`
const ITEM_DESC_ERROR = 'Each line item needs a description (up to 200 characters).'
const QTY_ERROR = 'Quantity must be a positive number with up to 2 decimals.'
const UNIT_ERROR = 'Unit price is not valid.'
const DAYS_ERROR = 'Schedule impact must be a whole number of days from -365 to 365.'
const TERMS_ERROR = 'Payment terms are too long (up to 200 characters).'
const MAX_QTY = 100000
const MAX_UNIT_CENTS = 100_000_000_00
const MAX_DAYS_IMPACT = 365
const FLOAT_ERROR_IN_HUNDREDTHS = 1e-6

const trimmedText = (min: number, max: number, error: string) =>
  z.string().catch('').pipe(z.string().trim().min(min, error).max(max, error))

const hasAtMostTwoDecimals = (qty: number) => Math.abs(qty * 100 - Math.round(qty * 100)) <= FLOAT_ERROR_IN_HUNDREDTHS

export const ItemSchema = z
  .object(
    {
      desc: trimmedText(1, 200, ITEM_DESC_ERROR),
      qty: z.coerce.number({ error: QTY_ERROR }).positive(QTY_ERROR).max(MAX_QTY, QTY_ERROR).refine(hasAtMostTwoDecimals, QTY_ERROR),
      unit_cents: z.coerce.number({ error: UNIT_ERROR }).int(UNIT_ERROR).min(-MAX_UNIT_CENTS, UNIT_ERROR).max(MAX_UNIT_CENTS, UNIT_ERROR),
    },
    { error: ITEM_DESC_ERROR },
  )
  .transform(({ desc, qty, unit_cents }) => {
    const hundredths = Math.round(qty * 100)

    return { desc, qty: hundredths / 100, unit_cents, line_cents: Math.round((hundredths * unit_cents) / 100) }
  })

export const CoSchema = z
  .object(
    {
      title: trimmedText(1, 120, TITLE_ERROR),
      description: trimmedText(0, 2000, DESCRIPTION_ERROR),
      items: z.array(z.unknown(), { error: ITEMS_ERROR }).min(1, ITEMS_ERROR).max(MAX_ITEMS, ITEMS_ERROR).pipe(z.array(ItemSchema)),
      days_impact: z.coerce
        .number({ error: DAYS_ERROR })
        .int(DAYS_ERROR)
        .min(-MAX_DAYS_IMPACT, DAYS_ERROR)
        .max(MAX_DAYS_IMPACT, DAYS_ERROR)
        .default(0),
      payment_terms: trimmedText(0, 200, TERMS_ERROR),
    },
    { error: TITLE_ERROR },
  )
  .transform(({ title, description, items, days_impact, payment_terms }) => ({
    title,
    description,
    items,
    amount_cents: items.reduce((s, i) => s + i.line_cents, 0),
    days_impact,
    payment_terms,
  }))
