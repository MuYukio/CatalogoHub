import { Suspense } from 'react';
import { Metadata } from 'next';
import CatalogClient from './CatalogClient';
import Header from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Catálogo | CatalogoHub',
  description: 'Explore e filtre jogos e animes com avaliação, gênero e muito mais.',
  openGraph: {
    title: 'Catálogo | CatalogoHub',
    description: 'Explore e filtre jogos e animes com avaliação, gênero e muito mais.',
  },
};

export default function CatalogPage() {
  return (
    <>
    <Header />
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <CatalogClient />
    </Suspense>
    </>
  );
}