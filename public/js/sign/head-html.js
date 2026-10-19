import { esc } from '../shared/esc.js'
import { rel } from './rel.js'

export function headHtml(d) {
  const b = d.business
  const phoneLink = b.phone ? '<a href="tel:' + esc(b.phone.replace(/[^0-9+]/g, '')) + '">' + esc(b.phone) + '</a>' : ''

  return '<div class="sign-head" data-zt-private>' + (d.logo_url ? '<img src="' + esc(rel(d.logo_url)) + '" alt="' + esc(b.name) + ' logo">' : '') +
    '<div><p class="semibold">' + esc(b.name || 'Your contractor') + '</p><p class="small muted">' +
    [b.license_no ? 'License # ' + esc(b.license_no) : '', phoneLink].filter(Boolean).join(' · ') +
    '</p></div></div>'
}
