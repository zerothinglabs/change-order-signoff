import { b64url } from './b64url'

export const randomToken = (n: number): string => b64url(crypto.getRandomValues(new Uint8Array(n)))
