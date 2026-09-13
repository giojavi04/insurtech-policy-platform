import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';
import type { CatalogRepository } from './catalog.repository';

function buildRepositoryMock(): CatalogRepository {
  return {
    findAllInsuranceTypes: vi.fn(),
    findInsuranceTypeByCode: vi.fn(),
    findCoveragesByInsuranceTypeCode: vi.fn(),
    findCoverageForType: vi.fn(),
    findAllLocations: vi.fn(),
    findLocationByCode: vi.fn(),
  } as unknown as CatalogRepository;
}

describe('CatalogService', () => {
  let repository: CatalogRepository;
  let service: CatalogService;

  beforeEach(() => {
    repository = buildRepositoryMock();
    service = new CatalogService(repository);
  });

  describe('listCoverages', () => {
    it('returns coverages for a known insurance type', async () => {
      vi.mocked(repository.findCoveragesByInsuranceTypeCode).mockResolvedValue([
        { code: 'BASICA', name: 'Cobertura Básica' },
      ]);

      const result = await service.listCoverages('AUTO');

      expect(result).toEqual([{ code: 'BASICA', name: 'Cobertura Básica' }]);
    });

    it('throws 400 CATALOG_VALUE_INVALID for an unknown insurance type', async () => {
      vi.mocked(repository.findCoveragesByInsuranceTypeCode).mockResolvedValue(null);

      await expect(service.listCoverages('UNKNOWN')).rejects.toMatchObject({
        status: 400,
        response: expect.objectContaining({ code: 'CATALOG_VALUE_INVALID' }),
      });
    });
  });

  describe('assertValidSelection', () => {
    it('resolves for a fully valid selection', async () => {
      vi.mocked(repository.findInsuranceTypeByCode).mockResolvedValue({
        id: 'ins-1',
        code: 'AUTO',
        name: 'Seguro de Auto',
      } as never);
      vi.mocked(repository.findLocationByCode).mockResolvedValue({
        id: 'loc-1',
        code: 'EC-AZUAY',
        name: 'Azuay',
      } as never);
      vi.mocked(repository.findCoverageForType).mockResolvedValue({
        id: 'cov-1',
        code: 'PREMIUM',
        name: 'Cobertura Premium',
        insuranceTypeId: 'ins-1',
      } as never);

      await expect(
        service.assertValidSelection({
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          location: 'EC-AZUAY',
        }),
      ).resolves.toBeUndefined();
    });

    it('rejects an unknown insuranceType code', async () => {
      vi.mocked(repository.findInsuranceTypeByCode).mockResolvedValue(null);

      await expect(
        service.assertValidSelection({
          insuranceType: 'UNKNOWN',
          coverage: 'BASICA',
          location: 'EC-AZUAY',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects HOGAR + PREMIUM as a catalog mismatch (HOGAR has no PREMIUM coverage)', async () => {
      vi.mocked(repository.findInsuranceTypeByCode).mockResolvedValue({
        id: 'ins-hogar',
        code: 'HOGAR',
        name: 'Seguro de Hogar',
      } as never);
      vi.mocked(repository.findLocationByCode).mockResolvedValue({
        id: 'loc-1',
        code: 'EC-AZUAY',
        name: 'Azuay',
      } as never);
      vi.mocked(repository.findCoverageForType).mockResolvedValue(null);

      const rejection = service.assertValidSelection({
        insuranceType: 'HOGAR',
        coverage: 'PREMIUM',
        location: 'EC-AZUAY',
      });

      await expect(rejection).rejects.toBeInstanceOf(BadRequestException);
      await expect(rejection).rejects.toMatchObject({
        response: expect.objectContaining({
          code: 'CATALOG_VALUE_INVALID',
          errors: [{ field: 'coverage', message: 'not available for the selected insurance type' }],
        }),
      });
    });

    it('rejects an unknown location code', async () => {
      vi.mocked(repository.findInsuranceTypeByCode).mockResolvedValue({
        id: 'ins-1',
        code: 'AUTO',
        name: 'Seguro de Auto',
      } as never);
      vi.mocked(repository.findLocationByCode).mockResolvedValue(null);

      await expect(
        service.assertValidSelection({
          insuranceType: 'AUTO',
          coverage: 'BASICA',
          location: 'EC-NOWHERE',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
