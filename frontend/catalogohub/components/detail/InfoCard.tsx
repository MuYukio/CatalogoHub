'use client';

import { cn } from '@/lib/utils';

const THEME_ACCENT = {
  game: 'text-blue-400',
  anime: 'text-purple-400',
} as const;

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: 'game' | 'anime';
  highlight?: 'green' | 'yellow' | 'red';
}

export function InfoCard({ icon, label, value, theme, highlight }: InfoCardProps) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card border-border shadow-sm">
      <div className={cn('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide', THEME_ACCENT[theme])}>
        {icon}
        {label}
      </div>
      <p className={cn(
        'font-bold text-sm leading-snug',
        highlight === 'green' ? 'text-green-500' :
        highlight === 'yellow' ? 'text-yellow-500' :
        highlight === 'red' ? 'text-red-500' :
        'text-foreground'
      )}>
        {value}
      </p>
    </div>
  );
}