export const sitemapXml = (urls: string[]) => {
  const entries = urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}
