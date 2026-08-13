"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { useGamesApiStatus } from "@/hooks/games/useGamesApiStatus";

export function GamesUnavailableModal() {
  const { data } = useGamesApiStatus();
  const [dismissed, setDismissed] = useState(false);

  const isUnavailable = data?.available === false;
  const shouldShow = isUnavailable && !dismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDismissed(true)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="ch-card w-full max-w-md p-6 relative"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="ch-eyebrow ch-eyebrow-games mb-4 inline-flex">
              <AlertTriangle className="h-3 w-3" />
              Aviso
            </span>

            <h3 className="font-display text-xl font-black mb-2">
              Catálogo de jogos temporariamente indisponível
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              Estamos com instabilidade no provedor de dados de jogos. Isso é
              temporário e não afeta o catálogo de animes. Tente novamente em
              alguns minutos.
            </p>

            <button
              onClick={() => setDismissed(true)}
              className="ch-btn-games w-full py-2.5 text-sm"
            >
              Entendi
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}