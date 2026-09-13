import { BadRequestException, Injectable } from '@nestjs/common';
import { ErrorCode } from '../common/problem-details/error-code.enum';
import { CatalogRepository, type CatalogItem } from './catalog.repository';

export interface CatalogSelection {
  insuranceType: string;
  coverage: string;
  location: string;
}

@Injectable()
export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}

  listInsuranceTypes(): Promise<CatalogItem[]> {
    return this.repository.findAllInsuranceTypes();
  }

  async listCoverages(insuranceTypeCode: string): Promise<CatalogItem[]> {
    const coverages = await this.repository.findCoveragesByInsuranceTypeCode(insuranceTypeCode);
    if (coverages === null) {
      throw this.invalid('insuranceType', insuranceTypeCode, 'unknown insurance type code');
    }
    return coverages;
  }

  listLocations(): Promise<CatalogItem[]> {
    return this.repository.findAllLocations();
  }

  /** Se usa en la creación de quotes: lanza 400 CATALOG_VALUE_INVALID ante cualquier desajuste. */
  async assertValidSelection(selection: CatalogSelection): Promise<void> {
    const insuranceType = await this.repository.findInsuranceTypeByCode(selection.insuranceType);
    if (!insuranceType) {
      throw this.invalid('insuranceType', selection.insuranceType, 'unknown insurance type code');
    }

    const location = await this.repository.findLocationByCode(selection.location);
    if (!location) {
      throw this.invalid('location', selection.location, 'unknown location code');
    }

    const coverage = await this.repository.findCoverageForType(
      selection.insuranceType,
      selection.coverage,
    );
    if (!coverage) {
      throw new BadRequestException({
        code: ErrorCode.CATALOG_VALUE_INVALID,
        detail: `Coverage '${selection.coverage}' is not available for insurance type '${selection.insuranceType}'.`,
        errors: [
          { field: 'coverage', message: 'not available for the selected insurance type' },
        ],
      });
    }
  }

  private invalid(field: string, value: string, message: string): BadRequestException {
    return new BadRequestException({
      code: ErrorCode.CATALOG_VALUE_INVALID,
      detail: `'${value}' is not a known catalog value for '${field}'.`,
      errors: [{ field, message }],
    });
  }
}
