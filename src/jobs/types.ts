export type Job = {
  id: string
  name: string
  client_name: string
  client_contact: string | null
  address: string | null
  original_cents: number
}

export type JobInput = {
  name: string
  client: string
  phone: string | null
  email: string | null
  address: string | null
  original: number
}
