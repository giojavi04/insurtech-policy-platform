import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const BASE = [
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control px-5 py-2.5',
  'font-sans text-sm font-semibold tracking-wide',
  'transition-[background-color,box-shadow,transform] duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
  'disabled:cursor-not-allowed',
].join(' ');

/**
 * La acción principal es la de la marca: relleno sólido en verde azulado,
 * sombra suave y difusa (nunca una sombra dura) y un pequeño movimiento al
 * activarse. La secundaria se mantiene como una superficie plana y tintada
 * para que la acción principal no quede ambigua.
 */
const VARIANTS: Record<Variant, string> = {
  primary: [
    'bg-brand text-white shadow-soft',
    'hover:bg-brand-deep',
    'active:translate-y-px',
    'disabled:bg-line disabled:text-ink-soft disabled:shadow-none',
    'disabled:hover:bg-line',
    'disabled:active:translate-y-0',
  ].join(' '),
  secondary: [
    'bg-lav text-ink',
    'hover:bg-lav-deep active:translate-y-px',
    'disabled:text-ink-soft disabled:opacity-60',
    'disabled:hover:bg-lav disabled:active:translate-y-0',
  ].join(' '),
};

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest} />;
}
