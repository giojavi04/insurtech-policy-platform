'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { FlowState, type FlowStep } from '@/components/layout/FlowState';
import { InertLink } from '@/components/ui/InertLink';
import { WingGlyph } from '@/components/ui/icons';
import { decodeJwtPayload } from '@/lib/auth/jwt';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQuoteStore } from '@/lib/store/quote.store';

interface PageShellProps {
  children: React.ReactNode;
}

/** Las rutas reales se proyectan sobre la pista comprimida de flujo de dos estados (D3). */
function flowStepForPath(pathname: string | null): FlowStep {
  if (pathname?.startsWith('/policies/')) return 'poliza';
  return 'cotizar';
}

function isCotizadorActive(pathname: string | null): boolean {
  return pathname === '/' || Boolean(pathname?.startsWith('/quotes/'));
}

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const parts = local.split(/[._-]/).filter(Boolean);
  const first = parts[0]?.[0] ?? local[0] ?? '?';
  const second = parts[1]?.[0] ?? local[1] ?? '';
  return (first + second).toUpperCase();
}

const TAB_BASE = 'rounded-control px-3 py-2 text-sm font-medium transition-colors';
const TAB_ACTIVE = 'bg-lav text-brand-deep';
const TAB_INACTIVE = 'text-ink-soft hover:text-ink';

/**
 * Marco compartido para todas las páginas: barra de navegación de marca,
 * identidad del usuario, la pista FlowState y una columna principal de
 * medida consistente.
 */
export function PageShell({ children }: PageShellProps) {
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const lastPolicyId = useQuoteStore((state) => state.lastPolicyId);
  const [showLogin, setShowLogin] = useState(false);

  const payload = decodeJwtPayload(token);
  const email = payload?.email;

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="print-hide sticky top-0 z-20 border-b border-line bg-paper-raised">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <WingGlyph className="h-9 w-9 shrink-0" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base font-extrabold tracking-tight text-ink">Insurtech</span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-ink-soft">Technical test</span>
              </span>
            </div>

            <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
              <Link
                href="/"
                className={`${TAB_BASE} ${isCotizadorActive(pathname) ? TAB_ACTIVE : TAB_INACTIVE}`}
              >
                Cotizador
              </Link>

              {lastPolicyId ? (
                <Link
                  href={`/policies/${lastPolicyId}`}
                  className={`${TAB_BASE} ${pathname?.startsWith('/policies/') ? TAB_ACTIVE : TAB_INACTIVE}`}
                >
                  Mis Pólizas
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    aria-disabled="true"
                    aria-describedby="mis-polizas-note"
                    className={`${TAB_BASE} ${TAB_INACTIVE} cursor-default opacity-60`}
                  >
                    Mis Pólizas
                  </button>
                  <span id="mis-polizas-note" className="sr-only font-mono text-[10px] text-ink-soft md:not-sr-only">
                    Sin pólizas aún
                  </span>
                </span>
              )}

              <InertLink className={`${TAB_BASE} ${TAB_INACTIVE}`} note="Ayuda no disponible en este demo.">
                Ayuda
              </InertLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {email ? (
              <div className="flex items-center gap-2.5" title={email}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand-deep">
                  {initialsFromEmail(email)}
                </span>
                <span className="hidden max-w-[18ch] truncate text-sm font-medium text-ink sm:inline">{email}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="text-sm font-semibold text-brand hover:text-brand-deep"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="print-hide border-b border-line bg-paper-raised">
        <div className="mx-auto w-full max-w-6xl px-5 py-3 sm:px-8">
          <FlowState current={flowStepForPath(pathname)} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>

      {showLogin && (
        <LoginDialog onSuccess={() => setShowLogin(false)} onCancel={() => setShowLogin(false)} />
      )}
    </div>
  );
}
