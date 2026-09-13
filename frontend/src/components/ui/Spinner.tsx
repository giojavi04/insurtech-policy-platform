interface SpinnerProps {
  className?: string;
}

/**
 * Indicador de carga inline. Bajo `prefers-reduced-motion` la rotación se
 * reemplaza por un pulso de opacidad simple para que el control siga leyendo
 * como "trabajando".
 */
export function Spinner({ className = 'h-4 w-4' }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={`${className} shrink-0 animate-spin motion-reduce:animate-pulse`}
    >
      <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2.2" />
      <path
        d="M14.4 8 A6.4 6.4 0 0 0 8 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
