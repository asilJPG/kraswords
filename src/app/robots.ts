import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://xn--80ahegq7axd.com' // Punycode для красвордс.com
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/setup-profile/', '/login'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
