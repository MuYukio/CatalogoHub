"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface CarouselImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  isAnime?: boolean;
}

function getOptimizedUrl(src: string): string {
  if (!src) return src;
  if (src.includes("cdn.myanimelist.net")) {
    let optimized = src
      .replace(/\/r\/\d+x\d+\//g, "/")
      .replace(/[?&]s=[a-f0-9]+/, "");
    optimized = optimized.replace(/(\.(jpg|webp|png))$/i, "l$1");
    return optimized;
  }
  return src;
}

export default function CarouselImage({
  src,
  alt,
  priority = false,
  isAnime = false,
}: CarouselImageProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const optimizedSrc = getOptimizedUrl(src);

  if (error || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center p-4">
          <div className="text-3xl mb-3">{isAnime ? "📺" : "🎮"}</div>
          <p className="text-sm opacity-80">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${optimizedSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "blur(28px) brightness(0.5) saturate(1.4)",
          transform: "scale(1.1)",
        }}
      />

      {/* Skeleton enquanto carrega */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800/60 z-10" />
      )}

      {isAnime ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            className="relative h-full max-h-[100%] aspect-[2/3] drop-shadow-2xl"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={isLoaded
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 1.06 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Image
              src={optimizedSrc}
              alt={alt}
              fill
              className="object-cover rounded-lg"
              quality={95}
              priority={priority}
              sizes="(max-width: 768px) 40vw, 25vw"
              onLoad={() => setIsLoaded(true)}
              onError={() => { setIsLoaded(true); setError(true); }}
            />
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={isLoaded
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.06 }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src={optimizedSrc}
            alt={alt}
            fill
            className="object-cover"
            quality={90}
            priority={priority}
            sizes="100vw"
            onLoad={() => setIsLoaded(true)}
            onError={() => { setIsLoaded(true); setError(true); }}
          />
        </motion.div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20" />
    </div>
  );
}