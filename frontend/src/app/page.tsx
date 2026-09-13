'use client';

import { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { LivePricingSidebar } from '@/components/quote/LivePricingSidebar';
import { QuoteForm, type QuoteFormRawValues } from '@/components/quote/QuoteForm';
import { WingGlyph } from '@/components/ui/icons';

/**
 * D1 — precio en vivo. El formulario transmite cada cambio de campo hasta
 * aquí mediante `onValuesChange`; la barra lateral se encarga del debounce,
 * de la llamada real `POST /quotes` y de la protección frente a respuestas
 * obsoletas con request-id.
 */
export default function HomePage() {
  const [values, setValues] = useState<QuoteFormRawValues>({});

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-4">
        <section>
          <div className="flex items-center gap-3">
            <WingGlyph className="h-9 w-9 shrink-0" />
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              Cotizador Exprés
            </h1>
          </div>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">
            Emisión digital 100% en vivo • Sin trámites físicos
          </p>
        </section>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px] sm:mt-12">
        <div className="rounded-card bg-paper-raised p-6 shadow-soft sm:p-8">
          <QuoteForm onValuesChange={setValues} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <LivePricingSidebar values={values} />
        </div>
      </div>
    </PageShell>
  );
}
