const HEAD_WITH_BASE_TWO_LEVELS_UP = '<head>\n  <base href="../../">'

export const appShell = async (assets: Fetcher, requestUrl: string) => {
  const res = await assets.fetch(new Request(new URL('/app', requestUrl)))
  const html = (await res.text()).replace('<head>', HEAD_WITH_BASE_TWO_LEVELS_UP)

  return new Response(html, { status: res.status === 200 ? 200 : 404, headers: { 'content-type': 'text/html; charset=UTF-8' } })
}
