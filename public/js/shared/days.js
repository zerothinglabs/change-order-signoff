export function days(d) {
  return d === 0 ? 'None' : (d > 0 ? '+' : '') + d + ' day' + (Math.abs(d) === 1 ? '' : 's')
}
