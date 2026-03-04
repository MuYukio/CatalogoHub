'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CarouselImageProps {
  src: string
  alt: string
  priority?: boolean
  isAnime?: boolean
}

function getOptimizedUrl(src: string): string {
  if (!src) return src

  if (src.includes('cdn.myanimelist.net')) {
    // Remove prefixos de tamanho (/r/96x136/, etc.)
    let optimized = src
      .replace(/\/r\/\d+x\d+\//g, '/')
      .replace(/[?&]s=[a-f0-9]+/, '') // remove hash de cache

    // MAL usa sufixo 'l' para large: 'image.jpg' → 'imagel.jpg'
    optimized = optimized.replace(/(\.(jpg|webp|png))$/i, 'l$1')

    return optimized
  }

  return src
}

export default function CarouselImage({ src, alt, priority = false, isAnime = false }: CarouselImageProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const optimizedSrc = getOptimizedUrl(src)

  if (error || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center p-4">
          <div className="text-3xl mb-3">{isAnime ? '📺' : '🎮'}</div>
          <p className="text-sm opacity-80">Imagem não disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Fundo blur — cobre todo o espaço, especialmente útil para imagens portrait de animes */}
      <div
        className="absolute inset-0 scale-125"
        style={{
          backgroundImage: `url(${optimizedSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'blur(28px) brightness(0.5) saturate(1.4)',
        }}
      />

      {/* Skeleton de loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse z-10" />
      )}

      {isAnime ? (
        // Animes: imagem centralizada em tamanho real + blur de fundo
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative h-full max-h-[100%] aspect-[2/3] drop-shadow-2xl">
            <Image
              src={optimizedSrc}
              alt={alt}
              fill
              className={`object-cover rounded-lg transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              quality={95}
              priority={priority}
              sizes="(max-width: 768px) 40vw, 25vw"
              onLoad={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setError(true) }}
            />
          </div>
        </div>
      ) : (
        // Games: imagem cobre todo o fundo (landscape nativa)
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          quality={90}
          priority={priority}
          sizes="100vw"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setError(true) }}
        />
      )}

      {/* Gradiente inferior para o texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20" />
    </div>
  )
}