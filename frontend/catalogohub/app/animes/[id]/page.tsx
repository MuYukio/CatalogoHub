import { Metadata } from 'next'
import AnimeDetailClient from './animeDetailClient'
import { animesService } from '@/services/animes.service'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const anime = await animesService.getByMalId(Number(id))
    return {
      title: `${anime.title} — CatalogoHub`,
      description: anime.synopsis ?? `Detalhes, episódios e avaliações de ${anime.title}.`,
      openGraph: {
        title: anime.title,
        description: anime.synopsis ?? `Detalhes de ${anime.title}`,
        images: anime.imageUrl ? [anime.imageUrl] : [],
        type: 'website',
      },
    }
  } catch {
    return { title: 'Anime — CatalogoHub' }
  }
}

export default function AnimeDetailPage({ params }: Props) {
  return <AnimeDetailClient params={params} />
}