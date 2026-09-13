'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Spinner } from '@/components/ui/Spinner';
import { policiesApi } from '@/lib/api/endpoints';
import { ApiError, toUserMessage } from '@/lib/api/problem-details';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQuoteStore } from '@/lib/store/quote.store';

interface IssuePolicyButtonProps {
  quoteId: string;
}

type Step = 'idle' | 'login' | 'confirm' | 'issuing';

const PANEL = 'flex flex-col gap-4 rounded-control bg-lav p-5';

/**
 * Contenedor: lee el almacén de autenticación; oculta o deshabilita la
 * emisión sin sesión, abre el diálogo de acceso cuando hace falta y exige
 * una confirmación explícita antes de llamar a POST /policies (con Bearer
 * adjunto por el cliente API).
 */
export function IssuePolicyButton({ quoteId }: IssuePolicyButtonProps) {
  const token = useAuthStore((state) => state.token);
  const setLastPolicyId = useQuoteStore((state) => state.setLastPolicyId);
  const router = useRouter();
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);

  async function issue() {
    setStep('issuing');
    setError(null);
    try {
      const policy = await policiesApi.issue(quoteId);
      setLastPolicyId(policy.id);
      router.push(`/policies/${policy.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? toUserMessage(err) : 'No se pudo emitir la póliza.');
      setStep('confirm');
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <div className={PANEL}>
          <p className="text-sm leading-relaxed text-ink-soft">
            Debes iniciar sesión para emitir una póliza de esta cotización.
          </p>
          <Button type="button" onClick={() => setStep('login')} className="w-full">
            Iniciar sesión para emitir póliza
          </Button>
        </div>
        {step === 'login' && (
          <LoginDialog onSuccess={() => setStep('confirm')} onCancel={() => setStep('idle')} />
        )}
      </div>
    );
  }

  if (step === 'confirm' || step === 'issuing') {
    return (
      <div role="group" aria-label="Confirmar emisión de póliza" className={`${PANEL} border-l-4 border-l-brand`}>
        {error && <ErrorBanner message={error} />}
        <p className="text-sm leading-relaxed text-ink">
          Confirma que deseas emitir una póliza para esta cotización. Esta acción no se puede deshacer.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={issue} disabled={step === 'issuing'} className="flex-1">
            {step === 'issuing' && <Spinner />}
            {step === 'issuing' ? 'Emitiendo póliza…' : 'Confirmar y emitir póliza'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStep('idle')} disabled={step === 'issuing'}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button type="button" onClick={() => setStep('confirm')} className="w-full justify-center gap-2">
      Emitir Póliza Inmediata
      <span aria-hidden="true">→</span>
    </Button>
  );
}
