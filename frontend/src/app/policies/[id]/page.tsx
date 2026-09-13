'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { SuccessBadge } from '@/components/policy/SuccessBadge';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingState } from '@/components/ui/LoadingState';
import { Pill } from '@/components/ui/Pill';
import { CopyGlyph, DownloadGlyph, PhoneGlyph, ShieldGlyph, WingGlyph } from '@/components/ui/icons';
import { policiesApi } from '@/lib/api/endpoints';
import { ApiError, toUserMessage } from '@/lib/api/problem-details';
import { decodeJwtPayload } from '@/lib/auth/jwt';
import { coverageFeaturesFor } from '@/lib/policy/coverage-features';
import { policyDigest, truncateDigest } from '@/lib/policy/digest';
import { computeExpiry } from '@/lib/policy/validity';
import { printPolicy } from '@/lib/print';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQuoteStore } from '@/lib/store/quote.store';
import type { PolicyResponse } from '@/lib/api/types';

interface PolicyPageProps {
  params: { id: string };
}

const SECTION_CAPTION = 'text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft';

export default function PolicyPage({ params }: PolicyPageProps) {
  const setLastPolicyId = useQuoteStore((state) => state.setLastPolicyId);
  const lastQuote = useQuoteStore((state) => state.lastQuote);
  const token = useAuthStore((state) => state.token);

  const [policy, setPolicy] = useState<PolicyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [digest, setDigest] = useState<string | null>(null);
  const [digestUnavailable, setDigestUnavailable] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await policiesApi.get(params.id);
      setPolicy(result);
      setLastPolicyId(result.id);
    } catch (err) {
      setError(err instanceof ApiError ? toUserMessage(err) : 'No se pudo cargar la póliza.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // SHA-256 real del JSON canónico de la póliza — calculado en cliente una
  // vez que la póliza ha cargado. `crypto.subtle` requiere un contexto seguro
  // (localhost lo cumple); si falta, se muestra un mensaje explícito de
  // indisponibilidad, nunca un hash fabricado.
  useEffect(() => {
    if (!policy) return undefined;
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      setDigestUnavailable(true);
      return undefined;
    }
    let cancelled = false;
    policyDigest(policy)
      .then((hash) => {
        if (!cancelled) setDigest(hash);
      })
      .catch(() => {
        if (!cancelled) setDigestUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, [policy]);

  async function handleCopyId() {
    if (!policy) return;
    try {
      await navigator.clipboard.writeText(policy.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // La API del portapapeles fue denegada o no está disponible (requiere un
      // contexto seguro): el campo de respaldo de solo lectura que sigue abajo
      // permite al usuario seleccionar y copiar manualmente.
    }
  }

  if (loading) {
    return (
      <PageShell>
        <LoadingState>Cargando póliza…</LoadingState>
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

  if (!policy) {
    return null;
  }

  const email = decodeJwtPayload(token)?.email;
  // Solo datos reales: el contrato fijo `PolicyResponse` no incluye detalle de
  // cobertura, así que el nombre del plan y el monto mensual solo se renderizan
  // cuando la cotización que originó esta póliza sigue siendo la `lastQuote`
  // en caché — nunca se fabrican al abrir un enlace directo o recargado.
  const matchingQuote = lastQuote && lastQuote.id === policy.quoteId ? lastQuote : null;
  const insuranceType = matchingQuote?.inputs.insuranceType;
  const coverage = matchingQuote?.inputs.coverage;
  const monthlyAmount = matchingQuote?.estimatedPremium;
  const features = coverageFeaturesFor(insuranceType);
  const expiry = computeExpiry(policy.issuedAt);
  const expiryLabel = expiry.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <PageShell>
      <div className="print-only mb-8 items-center gap-2">
        <WingGlyph className="h-8 w-8" />
        <span className="font-display text-lg font-extrabold text-ink">Insurtech</span>
        <span className="font-mono text-xs text-ink-soft">Certificado de Póliza</span>
      </div>

      <div className="print-hide flex flex-col items-center text-center">
        <SuccessBadge />
        <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          ¡Tu cobertura está formalmente activa!
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
          La emisión digital fue confirmada y registrada en el sistema central de suscripción.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column — contract card */}
        <div className="card-print overflow-hidden rounded-card bg-paper-raised shadow-soft">
          <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-brand to-ok" />
          <div className="flex flex-col gap-6 p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={SECTION_CAPTION}>Identificador técnico de contrato</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="break-all rounded-control bg-lav px-3 py-2 font-mono text-sm text-ink">
                    {policy.id}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="print-hide inline-flex items-center gap-1.5 rounded-control bg-lav px-2.5 py-2 text-xs font-semibold text-brand hover:bg-lav-deep"
                  >
                    <CopyGlyph className="h-3.5 w-3.5" />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                {copied && (
                  <p role="status" className="print-hide mt-1 text-xs text-ok">
                    Copiado al portapapeles.
                  </p>
                )}
                <label className="sr-only" htmlFor="policy-id-fallback">
                  ID de póliza para copia manual
                </label>
                <input
                  id="policy-id-fallback"
                  readOnly
                  value={policy.id}
                  onFocus={(event) => event.currentTarget.select()}
                  className="print-hide sr-only focus:not-sr-only focus:mt-2 focus:block focus:w-full focus:rounded-control focus:border focus:border-line focus:bg-paper-raised focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
                />
              </div>
              <Pill variant="ok" className="font-mono uppercase">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
                Status: {policy.status}
              </Pill>
            </div>

            <div className="rounded-control bg-lav p-4">
              <p className={SECTION_CAPTION}>Titular asegurado</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-ink-soft">Correo electrónico</p>
                  <p className="font-medium text-ink">{email ?? 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-xs normal-case text-ink-soft">Vigencia anual (calculada)</p>
                  <p
                    className="font-medium text-ink nums-tabular"
                    title={`Calculada en el cliente como issuedAt + 1 año, a partir de ${policy.issuedAt}`}
                  >
                    Hoy → {expiryLabel}
                  </p>
                </div>
              </div>
            </div>

            <div>
              {matchingQuote ? (
                <h2 className="font-display text-lg font-semibold text-ink">
                  Seguro {insuranceType} • Plan {coverage}
                </h2>
              ) : (
                <h2 className="font-display text-lg font-semibold text-ink">Detalle del plan</h2>
              )}
              <p className="mt-1 font-mono text-xs text-ink-soft">Quote ID de origen: {policy.quoteId}</p>

              {features.length > 0 && (
                <>
                  <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                    Información de cobertura ilustrativa del plan — contenido de referencia, no un campo devuelto
                    por el backend.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {features.map((feature) => (
                      <div key={feature.title} className="rounded-control bg-lav p-4">
                        <ShieldGlyph className="h-4 w-4 text-brand" />
                        <p className="mt-2 text-sm font-semibold text-ink">{feature.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 font-mono text-xs text-ink-soft">
              <span>
                SHA-256:{' '}
                {digest ? (
                  <>
                    <span className="digest-trunc">{truncateDigest(digest)}</span>
                    <span className="digest-full">{digest}</span>
                  </>
                ) : digestUnavailable ? (
                  'No disponible en este contexto'
                ) : (
                  'Calculando…'
                )}
              </span>
              <span>Timestamp: {policy.issuedAt}</span>
            </div>
            {digest && (
              <details className="print-hide -mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-brand hover:text-brand-deep">
                  Ver completo
                </summary>
                <code className="mt-2 block select-all break-all rounded bg-lav-deep px-2 py-1.5 font-mono text-xs text-ink">
                  {digest}
                </code>
              </details>
            )}
          </div>
        </div>

        {/* Right column — actions sidebar */}
        <aside className="print-hide flex flex-col gap-5">
          <div className="rounded-card bg-lav p-5">
            <p className={SECTION_CAPTION}>Inversión mensual confirmada</p>
            {monthlyAmount ? (
              <p className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-2xl font-extrabold text-brand">$</span>
                <span className="font-display text-5xl font-extrabold leading-none text-ink nums-tabular">
                  {monthlyAmount}
                </span>
                <span className="text-sm font-medium text-ink-soft">/mes</span>
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Monto no disponible: esta póliza se abrió desde un enlace directo, sin la cotización en caché.
              </p>
            )}
          </div>

          <Button type="button" onClick={printPolicy} className="w-full justify-center gap-2">
            <DownloadGlyph className="h-4 w-4" />
            Descargar Póliza y Certificado (PDF)
          </Button>

          <div className="flex items-start gap-2.5 rounded-control bg-lav p-4">
            <ShieldGlyph className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold text-ink">Garantía Actuarial &amp; Validez Legal</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Documento emitido con firma electrónica y respaldo del sistema central de suscripción.
              </p>
            </div>
          </div>

          <Link href="/" className="text-center text-sm font-semibold text-brand hover:text-brand-deep">
            Realizar una nueva cotización →
          </Link>

          <div className="flex items-center gap-3 rounded-card bg-paper-raised p-4 shadow-soft">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-deep">
              <PhoneGlyph className="h-4 w-4" />
            </span>
            <div>
              <p className={SECTION_CAPTION}>Central de Siniestros y Grúa</p>
              <p className="font-mono text-sm font-semibold text-ink">1800-INSURTECH</p>
              <p className="text-xs leading-relaxed text-ink-soft">Contenido informativo — no funcional en este demo.</p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
