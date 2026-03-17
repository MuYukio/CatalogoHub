import { Metadata } from 'next'
import HomePage from '@/components/home/Homepage'

export const metadata: Metadata = {
  title: 'CatalogoHub — Jogos e Animes',
  description: 'Descubra os melhores jogos e animes em um só lugar. Salve seus favoritos e explore lançamentos.',
  openGraph: {
    title: 'CatalogoHub',
    description: 'Descubra os melhores jogos e animes em um só lugar.',
    url: 'https://catalogohub.vercel.app',
    siteName: 'CatalogoHub',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function Page() {
  return <HomePage />
}