'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { IssuePolicyButton } from '@/components/policy/IssuePolicyButton';
import { PremiumBreakdown } from '@/components/quote/PremiumBreakdown';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingState } from '@/components/ui/LoadingState';
import { quotesApi } from '@/lib/api/endpoints';
import { ApiError, toUserMessage } from '@/lib/api/problem-details';
import { useQuoteStore } from '@/lib/store/quote.store';
import type { QuoteResponse } from '@/lib/api/types';

interface QuotePageProps {
  params: { id: string };
}

export default function QuotePage({ params }: QuotePageProps) {
  const cached = useQuoteStore((state) => state.lastQuote);
  const initial = cached && cached.id === params.id ? cached : null;
  const [quote, setQuote] = useState<QuoteResponse | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await quotesApi.get(params.id);
      setQuote(result);
    } catch (err) {
      setError(err instanceof ApiError ? toUserMessage(err) : 'No se pudo cargar la cotización.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initial) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <PageShell>
        <LoadingState>Cargando cotización…</LoadingState>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <ErrorBanner message={error} onRetry={load} />
      </PageShell>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <PageShell>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
        Tu cotización
      </h1>
      <p className="mt-2 font-mono text-sm text-ink-soft">
        Cotización #{quote.id.slice(0, 8)} • {quote.inputs.insuranceType} • {quote.inputs.coverage}
      </p>
      <div className="mt-8">
        <PremiumBreakdown breakdown={quote.breakdown} estimatedPremium={quote.estimatedPremium} />
      </div>
      <div className="mt-8 max-w-sm">
        <IssuePolicyButton quoteId={quote.id} />
      </div>
    </PageShell>
  );
}
