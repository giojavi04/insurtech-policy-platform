'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { QuoteFormRawValues } from '@/components/quote/QuoteForm';
import { IssuePolicyButton } from '@/components/policy/IssuePolicyButton';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Pill } from '@/components/ui/Pill';
import { quotesApi } from '@/lib/api/endpoints';
import { ApiError, toUserMessage } from '@/lib/api/problem-details';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { PREMIUM_CONCEPT_LABELS, labelFor } from '@/lib/labels';
import { quoteFormSchema } from '@/lib/schemas/quote.schema';
import { useQuoteStore } from '@/lib/store/quote.store';
import type { QuoteResponse } from '@/lib/api/types';

interface LivePricingSidebarProps {
  values: QuoteFormRawValues;
}

type SidebarState =
  | { kind: 'idle' }
  | { kind: 'loading'; previous?: QuoteResponse }
  | { kind: 'ready'; quote: QuoteResponse }
  | { kind: 'error'; message: string; previous?: QuoteResponse };

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? toUserMessage(error) : fallback;
}

/** Cualquiera sea la cotización que debe renderizarse actualmente en el bloque total, en cualquier estado. */
function quoteToRender(state: SidebarState): QuoteResponse | undefined {
  if (state.kind === 'ready') return state.quote;
  if (state.kind === 'loading' || state.kind === 'error') return state.previous;
  return undefined;
}

/**
 * D1 — precio real con debounce (design ADR). Alrededor de 500 ms después
 * del último cambio en un conjunto completo y válido según el catálogo, se
 * dispara un `POST /quotes` real. No hay duplicado del cálculo de prima en
 * cliente: cada número llega directamente de la respuesta del backend. Un
 * identificador de petición creciente (no `AbortController`) descarta cualquier
 * respuesta reemplazada por una petición nueva que comenzó antes de que la
 * anterior se resolviera.
 */
export function LivePricingSidebar({ values }: LivePricingSidebarProps) {
  const setLastQuote = useQuoteStore((state) => state.setLastQuote);
  const debounced = useDebouncedValue(values, 500);
  const requestIdRef = useRef(0);
  const [state, setState] = useState<SidebarState>({ kind: 'idle' });

  useEffect(() => {
    const parsed = quoteFormSchema.safeParse(debounced);
    if (!parsed.success) {
      setState({ kind: 'idle' });
      return;
    }

    const requestId = ++requestIdRef.current;
    setState((previousState) => ({
      kind: 'loading',
      previous: quoteToRender(previousState),
    }));

    quotesApi
      .create(parsed.data)
      .then((quote) => {
        if (requestId !== requestIdRef.current) return; // Superseded — discard silently.
        setState({ kind: 'ready', quote });
        setLastQuote(quote);
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) return; // Superseded — discard silently.
        setState((previousState) => ({
          kind: 'error',
          message: messageFor(error, 'No se pudo calcular la cuota.'),
          previous: quoteToRender(previousState),
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const quote = quoteToRender(state);
  const busy = state.kind === 'loading';

  const badge =
    state.kind === 'ready'
      ? { variant: 'ok' as const, label: 'En Tiempo Real' }
      : state.kind === 'loading'
        ? { variant: 'info' as const, label: 'Actualizando…' }
        : state.kind === 'error'
          ? { variant: 'neutral' as const, label: 'Error' }
          : { variant: 'neutral' as const, label: 'En espera' };

  return (
    <aside className="flex flex-col gap-5 rounded-card bg-paper-raised p-6 shadow-lift sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Resumen de Cuota</span>
        <Pill variant={badge.variant}>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge.label}
        </Pill>
      </div>

      {state.kind === 'idle' && (
        <p role="status" className="rounded-control bg-lav p-6 text-center text-sm leading-relaxed text-ink-soft">
          Completa los datos para ver tu cuota
        </p>
      )}

      {state.kind === 'error' && <ErrorBanner message={state.message} />}

      {quote && (
        <div aria-busy={busy} className={`rounded-card bg-lav p-5 ${busy ? 'opacity-70' : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Inversión mensual total</p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl font-extrabold text-brand">$</span>
            <span className="font-display text-5xl font-extrabold leading-none text-ink nums-tabular sm:text-6xl">
              {quote.estimatedPremium}
            </span>
            <span className="text-sm font-medium text-ink-soft">/mes</span>
          </p>
          <p className="mt-2 font-mono text-sm text-brand">
            {quote.inputs.insuranceType} • {quote.inputs.coverage}
          </p>
        </div>
      )}

      {busy && !quote && (
        <div aria-busy="true" className="flex flex-col gap-2 rounded-card bg-lav p-5">
          <div className="h-3 w-32 animate-pulse rounded bg-lav-deep" />
          <div className="h-11 w-40 animate-pulse rounded bg-lav-deep" />
        </div>
      )}

      {quote && (
        <div className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
          {quote.breakdown.map((item) => (
            <div key={item.concept} className="flex items-center justify-between">
              <span className="text-ink-soft">{labelFor(PREMIUM_CONCEPT_LABELS, item.concept)}</span>
              <span className="font-mono nums-tabular text-ink">{item.amount}</span>
            </div>
          ))}
        </div>
      )}

      {state.kind === 'ready' && (
        <Link href={`/quotes/${state.quote.id}`} className="text-sm font-semibold text-brand hover:text-brand-deep">
          Cotización #{state.quote.id.slice(0, 8)}
        </Link>
      )}

      {state.kind === 'ready' ? (
        <IssuePolicyButton key={state.quote.id} quoteId={state.quote.id} />
      ) : (
        <Button type="button" disabled className="w-full justify-center">
          Emitir Póliza Inmediata
        </Button>
      )}

      <p className="flex flex-wrap items-center justify-center gap-2 text-center font-mono text-[10px] text-ink-soft">
        <span>Encriptación TLS</span>
        <span aria-hidden="true">•</span>
        <span>Activación en 2 min</span>
      </p>
    </aside>
  );
}
