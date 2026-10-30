import { describe, expect, it } from 'vitest'
import { moduleSource } from './helpers/module-source'

type Attrs = Map<string, string>
type FakeInput = { id: string; value: string; attrs: Attrs; after: string[]; focused: boolean }

const decimalSource = moduleSource('js/app/decimal-value.js')
const decimalValue = new Function(decimalSource + 'return decimalValue')() as (v: string) => number
const toCents = new Function(decimalSource + moduleSource('js/app/to-cents.js') + 'return toCents')() as (v: string) => number

const fakeInput = (id: string, value: string): FakeInput => ({ id, value, attrs: new Map(), after: [], focused: false })

const fakeDom = () => {
  const errors = new Map<string, { remove(): void }>()

  const element = (input: FakeInput) => ({
    id: input.id,
    setAttribute: (k: string, v: string) => input.attrs.set(k, v),
    removeAttribute: (k: string) => input.attrs.delete(k),
    insertAdjacentHTML: (_: string, html: string) => {
      const id = /id="([^"]+)"/.exec(html)![1]!

      input.after.push(html)
      errors.set(id, { remove: () => { errors.delete(id); input.after.pop() } })
    },
  })

  return { getElementById: (id: string) => errors.get(id) ?? null, element }
}

const loadFlagField = (doc: object) => new Function('document', moduleSource('js/app/flag-field.js') + 'return flagField')(doc) as (input: object, error: string) => void

describe('amount and quantity input', () => {
  it('rejects unit prices with extra symbols or unfinished numbers', () => {
    for (const bad of ['12..50', '12.', '1,2,3', '12.505', '$-12', '12abc', '1/2', '', '-', '$']) expect(toCents(bad), bad).toBeNaN()
  })

  it('reads full unit prices, with $, thousands commas and a minus for credits', () => {
    expect(toCents('12.50')).toBe(1250)
    expect(toCents(' $1,234.50 ')).toBe(123450)
    expect(toCents('-40')).toBe(-4000)
    expect(toCents('-$12.5')).toBe(-1250)
    expect(toCents('.75')).toBe(75)
    expect(toCents('18400')).toBe(1840000)
  })

  it('rejects quantities that are not one whole number', () => {
    for (const bad of ['1/2', '1..5', '2.', '1,00', '1.555', '1e3', '-2', '']) expect(decimalValue(bad), bad).toBeNaN()

    expect(decimalValue('1.5')).toBe(1.5)
    expect(decimalValue('1,000')).toBe(1000)
    expect(decimalValue(' 2 ')).toBe(2)
  })

  it('marks a bad field with an error the screen reader links to, and clears it once fixed', () => {
    const input = fakeInput('u1', '12..50')
    const dom = fakeDom()
    const flagField = loadFlagField(dom)
    const el = dom.element(input)

    flagField(el, 'Enter a price, like 12.50 or -40.')
    expect(input.attrs.get('aria-invalid')).toBe('true')
    expect(input.attrs.get('aria-describedby')).toBe('u1-error')
    expect(input.after).toEqual(['<span class="field-error" id="u1-error">Enter a price, like 12.50 or -40.</span>'])

    flagField(el, '')
    expect(input.attrs.size).toBe(0)
    expect(input.after).toEqual([])
  })

  it('flags a 1/2 quantity and a 12..50 unit price on the line instead of reading 1 and 1200', () => {
    const qty = fakeInput('q1', '1/2')
    const unit = fakeInput('u1', '12..50')
    const flagged: [string, string][] = []
    const field = (value: string) => ({ value })
    const row = { querySelector: (s: string) => ({ '.i-desc': field('Outlets'), '.i-qty': qty, '.i-unit': unit })[s] }
    const doc = { querySelectorAll: () => [row] }
    const flagField = (input: FakeInput, error: string) => flagged.push([input.id, error])
    const make = new Function('document', 'decimalValue', 'flagField', 'toCents', moduleSource('js/app/read-item-rows.js') + 'return readItemRows')
    const rows = make(doc, decimalValue, flagField, toCents)() as { qty: number; unit_cents: number }[]

    expect(rows[0]!.qty).toBeNaN()
    expect(rows[0]!.unit_cents).toBeNaN()
    expect(flagged).toEqual([['q1', 'Enter a number, like 2 or 1.5.'], ['u1', 'Enter a price, like 12.50 or -40.']])
  })

  it('does not save a change order while a line has a bad number', () => {
    const calls: string[] = []
    const bad = { focus: () => calls.push('focus') }
    const doc = { getElementById: () => ({}), querySelector: (s: string) => (s === '#items [aria-invalid]' ? bad : null) }
    const fail = (_: unknown, err: { message: string }) => calls.push(err.message)
    const saveCo = () => calls.push('save')
    const readItemRows = () => [{ desc: 'Outlets', qty: NaN, unit_cents: 1250 }]
    const make = new Function('document', 'track', 'coPath', 'fail', 'fieldValue', 'navigate', 'readItemRows', 'saveCo', 'sendCo', 'uploadPhotos', moduleSource('js/app/submit-co-form.js') + 'return submitCoForm')
    const submit = make(doc, () => undefined, () => '', fail, () => '', () => undefined, readItemRows, saveCo, () => undefined, () => undefined)

    submit({ preventDefault() {} }, { co: { job_id: 'j' }, files: [] })
    expect(calls).toEqual(['focus', 'Fix the marked quantity or unit price.'])
  })
})
