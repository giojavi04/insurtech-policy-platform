import { Injectable } from '@nestjs/common';
import type { QuoteLookupPort, QuoteSnapshot } from '../../policy/ports/quote-lookup.port';
import { QuoteRepository } from './quote.repository';

/**
 * In-process stand-in for the "internal HTTP or messaging" call between the
 * Quote and Policy modules (design decision D2). Reads directly from
 * QuoteRepository within the same process; a real split swaps this for an
 * HTTP/broker-backed adapter bound to the same QUOTE_LOOKUP token.
 */
@Injectable()
export class InProcessQuoteLookupAdapter implements QuoteLookupPort {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async findById(quoteId: string): Promise<QuoteSnapshot | null> {
    const quote = await this.quoteRepository.findById(quoteId);
    if (!quote) {
      return null;
    }
    return {
      id: quote.id,
      status: quote.status as 'QUOTED',
      estimatedPremium: quote.estimatedPremium.toFixed(2),
    };
  }
}
