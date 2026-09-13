export type InsuranceTypeCode = 'AUTO' | 'SALUD' | 'HOGAR';
export type CoverageCode = 'BASICA' | 'ESTANDAR' | 'PREMIUM';
export type LocationCode = 'EC-AZUAY' | 'EC-PICHINCHA' | 'EC-GUAYAS' | 'EC-MANABI' | 'EC-LOJA';

export interface PremiumBreakdownItem {
  concept: string;
  amount: string;
}

export interface PremiumInput {
  insuranceType: InsuranceTypeCode;
  coverage: CoverageCode;
  age: number;
  location: LocationCode;
}

export interface PremiumResult {
  estimatedPremium: string;
  breakdown: PremiumBreakdownItem[];
}
