const STARTS_LIKE_SPREADSHEET_FORMULA = /^[=+\-@\t\r]/
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/
const NEEDS_QUOTES = /[",\n\r]/

export const csvCell = (v: unknown): string => {
  const s = String(v ?? '')
  const formulaSafe = STARTS_LIKE_SPREADSHEET_FORMULA.test(s) && !PLAIN_NUMBER.test(s) ? "'" + s : s

  return NEEDS_QUOTES.test(formulaSafe) ? '"' + formulaSafe.replace(/"/g, '""') + '"' : formulaSafe
}
