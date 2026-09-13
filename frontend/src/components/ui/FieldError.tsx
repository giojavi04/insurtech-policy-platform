import { WarnGlyph } from '@/components/ui/icons';

interface FieldErrorProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Error a nivel de campo: color, icono y texto, para que el fallo nunca
 * dependa solo del color. Mantiene el role="alert" y el id al que apunta
 * aria-describedby del input.
 */
export function FieldError({ id, children }: FieldErrorProps) {
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <WarnGlyph className="mt-[0.15em] h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}
