export function copyText(text, btn) {
  const askToCopy = () => prompt('Copy this link:', text)

  const showCopied = () => {
    const label = btn.textContent

    btn.textContent = 'Copied'
    setTimeout(() => { btn.textContent = label }, 1500)
  }

  if (navigator.clipboard) navigator.clipboard.writeText(text).then(showCopied, askToCopy)
  else askToCopy()
}
