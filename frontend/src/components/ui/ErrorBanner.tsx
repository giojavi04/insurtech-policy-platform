import { WarnGlyph } from '@/components/ui/icons';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Banner de error global o por acción, de presentación. El detalle RFC7807
 * ya fue convertido en un mensaje de usuario por quien llama.
 * Usa el rojo de --danger en lugar del acento verde --brand para que
 * "algo falló" no parezca "esta es la acción principal".
 */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-md border border-line border-l-4 border-l-danger bg-danger-soft p-3.5 text-sm text-danger"
    >
      <span className="flex items-start gap-2 font-medium">
        <WarnGlyph className="mt-[0.15em] h-4 w-4 shrink-0" />
        {message}
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-md border border-danger px-3 py-1.5 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-paper-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
