  import type { Metadata } from "next";
  import { Inter } from 'next/font/google'
  import { Providers } from './providers/providers'
  
  import './globals.css'

  const inter = Inter({ subsets: ['latin'] })

  export const metadata: Metadata = {
  title: 'CatalogoHub',
  description: 'Gerencie sua colecao de jogos e animes favoritos',
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
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={inter.className}>
          
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    );
  }