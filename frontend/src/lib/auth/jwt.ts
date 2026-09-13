/**
 * SOLO DESCODIFICAR. Esto es puramente de presentación — no verifica firma
 * y nunca debe bloquear una acción. El backend sigue siendo la autoridad
 * única sobre la validez del token; esto solo lee datos de visualización
 * (por ejemplo, el correo del usuario demo) desde un token ya confiable
 * para la zona de identidad de navegación.
 */
export interface JwtPayload {
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string | null): JwtPayload | null {
  const segment = token?.split('.')[1];
  if (!segment) return null;
  try {
    const base64 = segment
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(segment.length / 4) * 4, '=');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
