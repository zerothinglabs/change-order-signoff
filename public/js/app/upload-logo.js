import { track } from '../shared/track.js'
import { api } from './api.js'
import { fail } from './fail.js'
import { showLogo } from './show-logo.js'
import { state } from './state.js'
import { upgradeLink } from './upgrade-link.js'

export function uploadLogo(input, msg) {
  const file = input.files[0]

  if (!file) return
  if (file.size > 1024 * 1024) return fail(msg, { message: 'Logo must be 1 MB or smaller.' })

  const fd = new FormData()

  fd.append('file', file)
  api('api/pro/workspace/logo', { form: fd }).then((d) => {
    state.ws.logo_url = d.logo_url
    track('logo_uploaded')
    msg.innerHTML = '<p class="small">Logo saved. It goes on change orders you send from now on.</p>'
    showLogo()
  }).catch((err) => {
    if (err.status === 402) msg.innerHTML = '<div class="notice">Logos are a Pro feature. ' + upgradeLink('logo') + '</div>'
    else fail(msg, err)
  })
}
