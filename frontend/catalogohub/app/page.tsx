import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function home(){

  return(
    <main className='min-h-screen flex flex-col items-center justify-center p-8'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      <h1 className='text-4xl font-bold mb-4'>
          🎮 CatalogoHub Front
      </h1>
      <p className='text-lg text-muted-foreground mb-8'>
        Arquitetura profissional deu certo
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">🎨 Sistema de Temas</h3>
          <p className="text-sm text-muted-foreground">
            Claro/Escuro com next-themes + CSS variables
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">⚡ Estado Global</h3>
          <p className="text-sm text-muted-foreground">
            Zustand + persistência local
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">🔌 Conexão API</h3>
          <p className="text-sm text-muted-foreground">
            Axios com interceptors JWT
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">📊 Gerenciamento de Dados</h3>
          <p className="text-sm text-muted-foreground">
            React Query configurado
          </p>
        </div>
      </div>

    </main>
  )


}