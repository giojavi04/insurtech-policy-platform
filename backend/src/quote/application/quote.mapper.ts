import type { PremiumBreakdownItem } from '../../domain/premium/premium.types';
import type { QuoteWithRelations } from '../infrastructure/quote.repository';
import type { QuoteResponseDto } from '../dto/quote-response.dto';

export function toQuoteResponseDto(quote: QuoteWithRelations): QuoteResponseDto {
  return {
    id: quote.id,
    status: quote.status,
    inputs: {
      insuranceType: quote.insuranceType.code,
      coverage: quote.coverage.code,
      age: quote.age,
      location: quote.location.code,
    },
    // `.toFixed(2)` (no `.toString()`) garantiza que la API renderice siempre
    // dos decimales, igual que la columna `Decimal(10,2)`, incluso cuando el
    // valor almacenado tiene ceros finales (por ejemplo, "350.00" y no "350").
    estimatedPremium: quote.estimatedPremium.toFixed(2),
    breakdown: quote.breakdown as unknown as PremiumBreakdownItem[],
    createdAt: quote.createdAt.toISOString(),
  };
}
