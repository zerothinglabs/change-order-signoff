export const splitContact = (phone: string | null, email: string | null): { phone: string | null; email: string | null } | string => {
  if (!phone?.includes('@')) return { phone, email }
  if (email) return 'Put only a phone number in the phone field.'

  return { phone: null, email: phone }
}
