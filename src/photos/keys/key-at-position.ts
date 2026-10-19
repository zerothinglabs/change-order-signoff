export const keyAtPosition = (keys: string[], position: string) => {
  const n = Number(position)

  return Number.isInteger(n) && n >= 1 ? keys[n - 1] : undefined
}
