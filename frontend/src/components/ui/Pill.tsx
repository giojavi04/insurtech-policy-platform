import type { ReactNode } from 'react';

type Variant = 'ok' | 'info' | 'neutral';

interface PillProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  ok: 'bg-ok-soft text-ok',
  info: 'bg-brand-tint text-brand-deep',
  neutral: 'bg-lav text-ink-soft',
};

/** Insignia redondeada pequeña usada para indicadores de estado o confianza en la pantalla y el shell. */
export function Pill({ variant = 'neutral', className = '', children }: PillProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
