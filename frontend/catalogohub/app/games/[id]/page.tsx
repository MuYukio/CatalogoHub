import { Metadata } from 'next'
import GameDetailClient from './gameDetailClient'
import { gamesService } from '@/services/games.service'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const game = await gamesService.getById(Number(id))
    return {
      title: `${game.name} — CatalogoHub`,
      description: game.description ?? `Detalhes, plataformas e avaliações de ${game.name}.`,
      openGraph: {
        title: game.name,
        description: game.description ?? `Detalhes de ${game.name}`,
        images: game.backgroundImage ? [game.backgroundImage] : [],
        type: 'website',
      },
    }
  } catch {
    return { title: 'Jogo — CatalogoHub' }
  }
}

export default function GameDetailPage({ params }: Props) {
  return <GameDetailClient params={params} />
}