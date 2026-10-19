import { drawSignForm } from './draw-sign-form.js'
import { signBodyHtml } from './sign-body-html.js'
import { signedCardHtml } from './signed-card-html.js'
import { view } from './view.js'
import { wirePdf } from './wire-pdf.js'
import { withdrawnHtml } from './withdrawn-html.js'

export function renderSign(d) {
  if (d.status === 'void') {
    view.innerHTML = withdrawnHtml(d)

    return
  }

  view.innerHTML = signBodyHtml(d)

  const box = document.getElementById('decision')

  if (d.signature) {
    box.innerHTML = signedCardHtml(d)
    wirePdf()

    return
  }

  if (d.status === 'sent') drawSignForm(box, d)
}
