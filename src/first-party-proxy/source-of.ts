export const sourceOf = (pageUrl = '') => {
  const params = URL.canParse(pageUrl) ? new URL(pageUrl).searchParams : new URLSearchParams()

  return params.get('ref') || params.get('utm_source')
}
