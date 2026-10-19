import { pdfLink } from './pdf-link.js'
import { wirePdf } from './wire-pdf.js'

export function showSigned(box, decision, saved) {
  box.innerHTML = '<div class="card" role="status"><h2>' + (decision === 'approved' ? 'Approved. Your contractor can see it now.' : 'Declined. Your contractor can see it now.') + '</h2>' +
    '<p>Keep a copy of the signed record for your files.</p><div>' + pdfLink({ pdf_url: saved.pdf_url }, 'Download your copy (PDF)') + '</div></div>'
  wirePdf()
  box.querySelector('h2').scrollIntoView({ block: 'center' })
}
