import { Injectable } from '@nestjs/common';
import { CatalogService } from '../../catalog/catalog.service';
import { calculatePremium } from '../../domain/premium/premium.calculator';
import type {
  CoverageCode,
  InsuranceTypeCode,
  LocationCode,
} from '../../domain/premium/premium.types';
import { QuoteRepository } from '../infrastructure/quote.repository';
import type { CreateQuoteDto } from '../dto/create-quote.dto';
import type { QuoteResponseDto } from '../dto/quote-response.dto';
import { toQuoteResponseDto } from './quote.mapper';

@Injectable()
export class CreateQuoteUseCase {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly quoteRepository: QuoteRepository,
  ) {}

  async execute(input: CreateQuoteDto): Promise<QuoteResponseDto> {
    await this.catalogService.assertValidSelection({
      insuranceType: input.insuranceType,
      coverage: input.coverage,
      location: input.location,
    });

    const { estimatedPremium, breakdown } = calculatePremium({
      insuranceType: input.insuranceType as InsuranceTypeCode,
      coverage: input.coverage as CoverageCode,
      age: input.age,
      location: input.location as LocationCode,
    });

    const quote = await this.quoteRepository.create({
      insuranceTypeCode: input.insuranceType,
      coverageCode: input.coverage,
      locationCode: input.location,
      age: input.age,
      estimatedPremium,
      breakdown,
    });

    return toQuoteResponseDto(quote);
  }
}
