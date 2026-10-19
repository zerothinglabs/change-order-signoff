export const amountBucket = (cents: number): string => {
  if (cents < 500_00) return '<500'
  if (cents < 2000_00) return '500-2000'
  if (cents <= 10000_00) return '2000-10000'

  return '>10000'
}
