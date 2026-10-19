import { absoluteUrl } from './absolute-url.js'

export function navigate(rel) {
  location.href = absoluteUrl(rel)
}
