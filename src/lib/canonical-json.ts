export const canonicalJson = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']'

  const obj = value as Record<string, unknown>
  const sortedDefinedKeys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort()

  return '{' + sortedDefinedKeys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}'
}
