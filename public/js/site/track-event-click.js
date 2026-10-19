export function trackEventClick(e) {
  const el = e.target.closest && e.target.closest('[data-zt-event]')

  if (el && window.zt) {
    let props = {}

    try { props = JSON.parse(el.getAttribute('data-zt-props') || '{}') } catch {}

    const name = el.getAttribute('data-zt-event')

    if (window.zt.track) window.zt.track(name, props)
    else window.zt(name, props)
  }

  if (e.target.closest && e.target.closest('[data-print]')) window.print()
}
