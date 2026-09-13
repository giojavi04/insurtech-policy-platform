import type {
  CoverageCode,
  InsuranceTypeCode,
  LocationCode,
} from '../src/domain/premium/premium.types.ts';

// Extraído de seed.ts para poder importarlo y comprobarlo frente a las
// tablas de tarifas sin disparar los efectos secundarios de BD del script.

export const INSURANCE_TYPES: Array<{ code: InsuranceTypeCode; name: string }> = [
  { code: 'AUTO', name: 'Seguro de Auto' },
  { code: 'SALUD', name: 'Seguro de Salud' },
  { code: 'HOGAR', name: 'Seguro de Hogar' },
];

export const COVERAGE_NAMES: Record<CoverageCode, string> = {
  BASICA: 'Cobertura Básica',
  ESTANDAR: 'Cobertura Estándar',
  PREMIUM: 'Cobertura Premium',
};

// HOGAR no ofrece PREMIUM de forma intencionada. Esa asimetría es lo que
// hace que el dropdown de coberturas dependiente (frontend) y el caso de
// validación 400 del backend de "coverage not valid for insuranceType"
// usen datos reales en lugar de un test double artificial.
export const COVERAGES_BY_TYPE: Record<InsuranceTypeCode, CoverageCode[]> = {
  AUTO: ['BASICA', 'ESTANDAR', 'PREMIUM'],
  SALUD: ['BASICA', 'ESTANDAR', 'PREMIUM'],
  HOGAR: ['BASICA', 'ESTANDAR'],
};

export const LOCATION_NAMES: Record<LocationCode, string> = {
  'EC-AZUAY': 'Azuay',
  'EC-PICHINCHA': 'Pichincha',
  'EC-GUAYAS': 'Guayas',
  'EC-MANABI': 'Manabí',
  'EC-LOJA': 'Loja',
};
