import type { CoverageCode, InsuranceTypeCode, LocationCode } from './premium.types';

// La calculadora se mantiene pura y comprobable por pruebas. El README
// la documenta como externalizable en producción, por ejemplo a una tabla de
// tarifas gestionada en base de datos, cuando eso sea un requisito real.

/** Base de prima por tipo de seguro, en la moneda única de la plataforma. */
export const BASE: Record<InsuranceTypeCode, number> = {
  AUTO: 200.0,
  SALUD: 150.0,
  HOGAR: 120.0,
};

export interface AgeBracket {
  min: number;
  max: number;
  rate: number;
}

/** Tasa aditiva aplicada sobre BASE, elegida según la edad del asegurado. */
export const AGE_BRACKETS: AgeBracket[] = [
  { min: 18, max: 25, rate: 0.4 },
  { min: 26, max: 35, rate: 0.3 },
  { min: 36, max: 50, rate: 0.2 },
  { min: 51, max: 65, rate: 0.35 },
  { min: 66, max: 99, rate: 0.5 },
];

/** Tasa aditiva aplicada sobre BASE, elegida según el código de ubicación sembrado. */
export const LOCATION_RATE: Record<LocationCode, number> = {
  'EC-AZUAY': 0.2,
  'EC-PICHINCHA': 0.25,
  'EC-GUAYAS': 0.3,
  'EC-MANABI': 0.22,
  'EC-LOJA': 0.15,
};

/** Tasa aditiva aplicada sobre BASE, elegida según el código de cobertura sembrado. */
export const COVERAGE_RATE: Record<CoverageCode, number> = {
  BASICA: 0.0,
  ESTANDAR: 0.12,
  PREMIUM: 0.25,
};

export function findAgeBracket(age: number): AgeBracket | undefined {
  return AGE_BRACKETS.find((bracket) => age >= bracket.min && age <= bracket.max);
}
