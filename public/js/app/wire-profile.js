import { saveProfile } from './save-profile.js'
import { showLogo } from './show-logo.js'
import { state } from './state.js'
import { uploadLogo } from './upload-logo.js'

export function wireProfile() {
  const msg = document.getElementById('p-msg')
  const input = document.getElementById('p-logo')

  document.getElementById('profile').onsubmit = (e) => saveProfile(e, msg)

  if (!input) return
  if (state.ws.logo_url) showLogo()

  input.onchange = () => uploadLogo(input, msg)
}
