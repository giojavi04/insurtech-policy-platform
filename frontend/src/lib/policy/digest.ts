import type { PolicyResponse } from '@/lib/api/types';

/**
 * Digest real de integridad con Web Crypto — nunca una cadena fabricada. El
 * orden canónico de campos de abajo ES el contrato: mantenerlo estable, o
 * cada hash mostrado antes cambiará de forma silenciosa.
 */
export async function policyDigest(policy: Pick<PolicyResponse, 'id' | 'quoteId' | 'status' | 'issuedAt'>): Promise<string> {
  const canonical = JSON.stringify({
    id: policy.id,
    quoteId: policy.quoteId,
    status: policy.status,
    issuedAt: policy.issuedAt,
  });
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** 4 caracteres + elipsis + 7 caracteres, igual al estilo del mockup `8f9b…31e2a90`. */
export function truncateDigest(hex: string): string {
  return `${hex.slice(0, 4)}…${hex.slice(-7)}`;
}
