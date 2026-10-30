export function flagField(input, error) {
  const errorId = input.id + '-error'

  document.getElementById(errorId)?.remove()
  input.removeAttribute('aria-invalid')
  input.removeAttribute('aria-describedby')

  if (!error) return

  input.setAttribute('aria-invalid', 'true')
  input.setAttribute('aria-describedby', errorId)
  input.insertAdjacentHTML('afterend', '<span class="field-error" id="' + errorId + '">' + error + '</span>')
}
