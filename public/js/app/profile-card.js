import { esc } from '../shared/esc.js'
import { state } from './state.js'
import { upgradeLink } from './upgrade-link.js'

export function profileCard() {
  const ws = state.ws

  const logo = ws.paid
    ? '<div class="field"><label for="p-logo">Logo (PNG or JPEG, up to 1 MB)</label>' +
      '<div class="row"><img id="logo-img" alt="Your logo" class="hidden ph-no-capture logo" data-zt-private><input id="p-logo" type="file" accept="image/png,image/jpeg"></div></div>'
    : '<div class="spread"><p class="small muted">Put your logo on the PDF and the signing page with Pro.</p>' + upgradeLink('logo', 'Add your logo') + '</div>'

  return '<form class="card" id="profile" novalidate><h2>Business profile</h2><p class="small muted">This goes on every change order you send.</p>' +
    '<div class="grid-2">' +
    '<div class="field"><label for="p-name">Business name</label><input id="p-name" maxlength="100" autocomplete="organization" value="' + esc(ws.business_name) + '"></div>' +
    '<div class="field"><label for="p-lic">License #</label><input id="p-lic" maxlength="50" value="' + esc(ws.license_no) + '"></div>' +
    '<div class="field"><label for="p-phone">Phone</label><input id="p-phone" type="tel" maxlength="40" autocomplete="tel" value="' + esc(ws.phone) + '"></div>' +
    '<div class="field"><label for="p-email">Business email</label><input id="p-email" type="email" maxlength="254" autocomplete="email" value="' + esc(ws.email) + '"></div>' +
    '</div>' + logo + '<div id="p-msg" role="status"></div><div><button class="btn" type="submit">Save profile</button></div></form>'
}
