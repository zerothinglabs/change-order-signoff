export function track(name, props) {
  if (!window.zt) return

  if (window.zt.track) return window.zt.track(name, props || {})

  return window.zt(name, props || {})
}
