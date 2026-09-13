import { CheckGlyph } from '@/components/ui/icons';

/**
 * El momento de unión, reestilizado para la superficie fintech segura:
 * una insignia de estado en verde menta con un icono de verificación y una
 * entrada breve tipo `pop-in` (240 ms de escala y desvanecimiento), en lugar
 * del sello de tinta retirado `PolicySeal`. Cuando `prefers-reduced-motion`
 * está activo, la entrada se degrada a un simple desvanecimiento mediante la
 * variante `motion-reduce:` de Tailwind — ver `tailwind.config.ts`.
 */
export function SuccessBadge() {
  return (
    <span
      role="status"
      className="inline-flex animate-pop-in items-center gap-2 rounded-pill bg-ok-soft px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-ok motion-reduce:animate-fade-in"
    >
      <CheckGlyph className="h-3.5 w-3.5" />
      Póliza Emitida y Activa
    </span>
  );
}
