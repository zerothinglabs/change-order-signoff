export function track(name, props) {
  if (!window.zt) return

  if (window.zt.track) window.zt.track(name, props || {})
  else window.zt(name, props || {})
}
