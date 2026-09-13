export const PREMIUM_CONCEPT_LABELS: Record<string, string> = {
  BASE: 'Base',
  AGE_FACTOR: 'Factor de edad',
  LOCATION_FACTOR: 'Factor de ubicación',
  COVERAGE_FACTOR: 'Factor de cobertura',
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  QUOTED: 'Cotizada',
};

export const POLICY_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activa',
};

/** Usa el código original si no aparece en el mapa, para que un valor inesperado del backend nunca desaparezca. */
export function labelFor(map: Record<string, string>, code: string): string {
  return map[code] ?? code;
}
