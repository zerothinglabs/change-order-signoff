const posthogReady = () => window.posthog && window.posthog.__loaded

export function holdBuyClick(e) {
  const a = e.target.closest && e.target.closest('a[data-zt-buy]')

  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  if (posthogReady()) return

  e.preventDefault()

  const start = Date.now()

  ;(function wait() {
    if (posthogReady()) setTimeout(() => { location.href = a.href }, 150)
    else if (Date.now() - start > 1500) location.href = a.href
    else setTimeout(wait, 50)
  })()
}
