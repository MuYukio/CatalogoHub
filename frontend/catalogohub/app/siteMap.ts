import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://catalogohub.vercel.app', lastModified: new Date() },
    { url: 'https://catalogohub.vercel.app/login', lastModified: new Date() },
    { url: 'https://catalogohub.vercel.app/register', lastModified: new Date() },
  ]
}
