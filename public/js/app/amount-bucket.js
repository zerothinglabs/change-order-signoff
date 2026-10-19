export function amountBucket(c) {
  return c < 50000 ? '<500' : c < 200000 ? '500-2000' : c <= 1000000 ? '2000-10000' : '>10000'
}
