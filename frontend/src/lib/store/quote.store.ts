import { create } from 'zustand';
import type { QuoteResponse } from '../api/types';

const LAST_POLICY_KEY = 'lsp.last-policy';

function readLastPolicyId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(LAST_POLICY_KEY);
  } catch {
    return null;
  }
}

// Guarda la cotización recién creada para que al navegar desde `/` a
// `/quotes/{id}` se renderice de inmediato en lugar de volver a pedir lo que
// ya devolvió el POST. `/quotes/[id]` sigue cayendo a un GET real cuando la
// caché falla (enlace directo, recarga o id distinto): el store es una
// optimización y nunca la fuente de verdad.
//
// `lastPolicyId` activa la pestaña "Mis Pólizas" (no existe endpoint de
// lista de pólizas en el contrato fijo): se refleja en sessionStorage para
// que una recarga mantenga el enlace sin la superficie XSS de una credencial
// persistida. Se escribe tras un `POST /policies` exitoso y tras un
// `GET /policies/{id}` exitoso.
interface QuoteState {
  lastQuote: QuoteResponse | null;
  lastPolicyId: string | null;
  setLastQuote: (quote: QuoteResponse) => void;
  setLastPolicyId: (id: string) => void;
  clear: () => void;
}

export const useQuoteStore = create<QuoteState>((set) => ({
  lastQuote: null,
  lastPolicyId: readLastPolicyId(),
  setLastQuote: (quote) => set({ lastQuote: quote }),
  setLastPolicyId: (id) => {
    try {
      sessionStorage.setItem(LAST_POLICY_KEY, id);
    } catch {
      // Navegación privada / almacenamiento deshabilitado: permanece solo en memoria para esta sesión.
    }
    set({ lastPolicyId: id });
  },
  clear: () => set({ lastQuote: null }),
}));
