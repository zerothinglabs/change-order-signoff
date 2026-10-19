import { sha256hex } from '../lib'

export const emailHash = async (slug: string, email: string): Promise<string> => sha256hex(`${slug}:${email.trim().toLowerCase()}`)
