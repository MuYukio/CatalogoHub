// app/layout.tsx
import type { Metadata } from "next";
import {  DM_Sans } from 'next/font/google'
import { Providers } from './providers/providers'
import './globals.css'


const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-dm' })

export const metadata: Metadata = {
  title: 'CatalogoHub',
  description: 'Gerencie sua coleção de jogos e animes favoritos',
  verification: {
    google: 'UijuhN281tQwHGm5aGbT3UOyJ0FokSrcljqsqyVMwaM',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}