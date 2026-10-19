export function absoluteUrl(rel) {
  return new URL(rel, document.baseURI).href
}
