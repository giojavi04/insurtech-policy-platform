// Refleja las formas de respuesta y petición de los contratos REST fijos del
// backend (backend/src/**/dto/*.ts). Se mantienen como tipos planos en lugar
// de importar desde el workspace del backend para que el frontend no dependa
// del backend en tiempo de compilación.

export type InsuranceTypeCode = 'AUTO' | 'SALUD' | 'HOGAR';
export type CoverageCode = 'BASICA' | 'ESTANDAR' | 'PREMIUM';

export interface CatalogItem {
  code: string;
  name: string;
}

export interface CatalogListResponse {
  items: CatalogItem[];
}

export interface QuoteInputs {
  insuranceType: string;
  coverage: string;
  age: number;
  location: string;
}

export interface PremiumBreakdownItem {
  concept: string;
  amount: string;
}

export interface QuoteResponse {
  id: string;
  status: string;
  inputs: QuoteInputs;
  estimatedPremium: string;
  breakdown: PremiumBreakdownItem[];
  createdAt: string;
}

export interface CreateQuoteInput {
  insuranceType: string;
  coverage: string;
  age: number;
  location: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
}

export interface PolicyResponse {
  id: string;
  quoteId: string;
  status: string;
  issuedAt: string;
}
