export function nameOk(form) {
  const n = form.name.value.trim()

  return n.length >= 2 && n.length <= 80
}
