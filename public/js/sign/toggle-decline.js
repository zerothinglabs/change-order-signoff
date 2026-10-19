export function toggleDecline(toggle) {
  const open = document.getElementById('decline').classList.toggle('hidden') === false

  toggle.setAttribute('aria-expanded', String(open))

  if (open) document.getElementById('reason').focus()
}
