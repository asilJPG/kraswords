import type { MetadataRoute } from 'next'
import { fetchPublishedCrosswords } from '@/lib/crossword/server-api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://xn--80ahegq7axd.com' // Punycode для красвордс.com
  
  // Получаем список всех опубликованных кроссвордов
  const crosswords = await fetchPublishedCrosswords().catch(() => [])
  
  const crosswordUrls = crosswords.map(cw => ({
    url: `${baseUrl}/play/${cw.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/top`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    ...crosswordUrls,
  ]
}
