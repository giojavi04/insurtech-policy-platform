import { apiClient } from './client';
import type {
  CatalogListResponse,
  CreateQuoteInput,
  LoginResponse,
  PolicyResponse,
  QuoteResponse,
} from './types';

export const catalogsApi = {
  listInsuranceTypes: () => apiClient.get<CatalogListResponse>('/catalogs/insurance-types'),
  listCoverages: (insuranceType: string) =>
    apiClient.get<CatalogListResponse>(`/catalogs/coverages?insuranceType=${encodeURIComponent(insuranceType)}`),
  listLocations: () => apiClient.get<CatalogListResponse>('/catalogs/locations'),
};

export const quotesApi = {
  create: (input: CreateQuoteInput) => apiClient.post<QuoteResponse>('/quotes', input),
  get: (id: string) => apiClient.get<QuoteResponse>(`/quotes/${encodeURIComponent(id)}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }),
};

export const policiesApi = {
  issue: (quoteId: string) => apiClient.post<PolicyResponse>('/policies', { quoteId }, { auth: true }),
  get: (id: string) => apiClient.get<PolicyResponse>(`/policies/${encodeURIComponent(id)}`, { auth: true }),
};
