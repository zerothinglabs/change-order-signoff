import { api } from './api.js'

export function showLogo() {
  const img = document.getElementById('logo-img')

  api('api/workspace/logo', { raw: true }).then((r) => (r.ok ? r.blob() : null)).then((b) => {
    if (!b) return

    img.src = URL.createObjectURL(b)
    img.classList.remove('hidden')
  })
}
