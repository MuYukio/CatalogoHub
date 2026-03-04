    import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackHomeButtonProps {
  className?: string
}

export function BackHomeButton({ className }: BackHomeButtonProps) {
  return (
    <Button variant="ghost" asChild className={`inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 ${className}`}>
      <Link href="/">
        <ArrowLeft size={18} />
        Voltar para início
      </Link>
    </Button>
  )
}