import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../common/problem-details/error-code.enum';
import { QuoteRepository } from '../infrastructure/quote.repository';
import type { QuoteResponseDto } from '../dto/quote-response.dto';
import { toQuoteResponseDto } from './quote.mapper';

@Injectable()
export class GetQuoteUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(id: string): Promise<QuoteResponseDto> {
    const quote = await this.quoteRepository.findById(id);
    if (!quote) {
      throw new NotFoundException({
        code: ErrorCode.QUOTE_NOT_FOUND,
        detail: `Quote '${id}' was not found.`,
      });
    }
    return toQuoteResponseDto(quote);
  }
}
