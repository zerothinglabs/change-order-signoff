import { absoluteUrl } from './absolute-url.js'
import { copyText } from './copy-text.js'
import { state } from './state.js'

export function wirePrivateLink() {
  const link = absoluteUrl('app#k=' + state.token)
  const copyButton = document.getElementById('copy-dash')

  document.getElementById('dash-link').value = link
  copyButton.onclick = () => copyText(link, copyButton)

  document.getElementById('sms-dash').onclick = () => {
    location.href = 'sms:?body=' + encodeURIComponent('My change order dashboard: ' + link)
  }
}
