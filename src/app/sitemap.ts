import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://millisecond.vercel.app'
  const locales = ['pt-BR', 'en']
  const routes = ['', '/draft', '/simulate']

  const sitemapEntries: MetadataRoute.Sitemap = []

  routes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: {
            'pt-BR': `${baseUrl}/pt-BR${route}`,
            'en': `${baseUrl}/en${route}`,
          },
        },
      })
    })
  })

  return sitemapEntries
}
