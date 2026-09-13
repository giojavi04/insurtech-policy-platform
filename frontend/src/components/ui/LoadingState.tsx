import { Spinner } from '@/components/ui/Spinner';

interface LoadingStateProps {
  children: React.ReactNode;
}

/**
 * Estado de carga centrado y enmarcado. El texto lo aporta quien llama y
 * la región viva role="status" se mantiene para que la espera sea anunciada.
 */
export function LoadingState({ children }: LoadingStateProps) {
  return (
    <p
      role="status"
      className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-paper-raised px-6 py-10 text-sm font-medium text-ink-soft"
    >
      <Spinner className="h-4 w-4 text-brand" />
      {children}
    </p>
  );
}
