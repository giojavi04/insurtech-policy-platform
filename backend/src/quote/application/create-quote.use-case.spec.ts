import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'decimal.js';
import { CreateQuoteUseCase } from './create-quote.use-case';
import type { CatalogService } from '../../catalog/catalog.service';
import type { QuoteRepository, QuoteWithRelations } from '../infrastructure/quote.repository';
import type { CreateQuoteDto } from '../dto/create-quote.dto';

function buildQuoteWithRelations(overrides: Partial<QuoteWithRelations> = {}): QuoteWithRelations {
  return {
    id: 'quote-1',
    insuranceTypeId: 'ins-1',
    coverageId: 'cov-1',
    locationId: 'loc-1',
    age: 35,
    estimatedPremium: new Decimal('350.00') as never,
    breakdown: [
      { concept: 'BASE', amount: '200.00' },
      { concept: 'AGE_FACTOR', amount: '60.00' },
      { concept: 'LOCATION_FACTOR', amount: '40.00' },
      { concept: 'COVERAGE_FACTOR', amount: '50.00' },
    ] as never,
    status: 'QUOTED' as never,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    insuranceType: { id: 'ins-1', code: 'AUTO', name: 'Seguro de Auto' } as never,
    coverage: {
      id: 'cov-1',
      code: 'PREMIUM',
      name: 'Cobertura Premium',
      insuranceTypeId: 'ins-1',
    } as never,
    location: { id: 'loc-1', code: 'EC-AZUAY', name: 'Azuay' } as never,
    ...overrides,
  } as QuoteWithRelations;
}

describe('CreateQuoteUseCase', () => {
  let catalogService: CatalogService;
  let quoteRepository: QuoteRepository;
  let useCase: CreateQuoteUseCase;

  beforeEach(() => {
    catalogService = { assertValidSelection: vi.fn() } as unknown as CatalogService;
    quoteRepository = { create: vi.fn() } as unknown as QuoteRepository;
    useCase = new CreateQuoteUseCase(catalogService, quoteRepository);
  });

  const validInput: CreateQuoteDto = {
    insuranceType: 'AUTO',
    coverage: 'PREMIUM',
    age: 35,
    location: 'EC-AZUAY',
  };

  it('validates catalog membership, calculates the premium, and persists the quote', async () => {
    vi.mocked(catalogService.assertValidSelection).mockResolvedValue(undefined);
    vi.mocked(quoteRepository.create).mockResolvedValue(buildQuoteWithRelations());

    const result = await useCase.execute(validInput);

    expect(catalogService.assertValidSelection).toHaveBeenCalledWith({
      insuranceType: 'AUTO',
      coverage: 'PREMIUM',
      location: 'EC-AZUAY',
    });
    expect(quoteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        insuranceTypeCode: 'AUTO',
        coverageCode: 'PREMIUM',
        locationCode: 'EC-AZUAY',
        age: 35,
        estimatedPremium: '350.00',
      }),
    );
    expect(result.estimatedPremium).toBe('350.00');
    expect(result.status).toBe('QUOTED');
  });

  it('propagates the catalog validation error and never persists a quote', async () => {
    vi.mocked(catalogService.assertValidSelection).mockRejectedValue(
      new BadRequestException({ code: 'CATALOG_VALUE_INVALID', detail: 'mismatch' }),
    );

    await expect(useCase.execute({ ...validInput, insuranceType: 'HOGAR' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(quoteRepository.create).not.toHaveBeenCalled();
  });

  it.each([18, 99])('accepts the boundary age %i and forwards it to the calculator', async (age) => {
    vi.mocked(catalogService.assertValidSelection).mockResolvedValue(undefined);
    vi.mocked(quoteRepository.create).mockResolvedValue(buildQuoteWithRelations({ age } as never));

    await useCase.execute({ ...validInput, age });

    expect(quoteRepository.create).toHaveBeenCalledWith(expect.objectContaining({ age }));
  });
});
