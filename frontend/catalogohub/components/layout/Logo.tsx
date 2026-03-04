
'use client'

import Image from 'next/image'
import { useState } from 'react'

export function Logo() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-30 flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br border border-border/10 ">
        {imageError ? (

          <div className="flex items-center justify-center w-full h-full">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CH
            </div>
          </div>
        ) : (
          <img 
            src="/v2.png" 
            alt="Test" 
            className="object-contain p-2" 
            style={{ width: '250%', height: '250%' }}
          />
        )}
      </div>
      <div>
        <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          CatalogoHub
        </h1>
        <p className="text-sm text-muted-foreground -mt-1">Descubra Jogos & Animes</p>
      </div>
    </div>
  )
}