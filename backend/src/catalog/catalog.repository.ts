import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface CatalogItem {
  code: string;
  name: string;
}

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllInsuranceTypes(): Promise<CatalogItem[]> {
    return this.prisma.insuranceType.findMany({
      select: { code: true, name: true },
      orderBy: { code: 'asc' },
    });
  }

  findInsuranceTypeByCode(code: string) {
    return this.prisma.insuranceType.findUnique({ where: { code } });
  }

  async findCoveragesByInsuranceTypeCode(code: string): Promise<CatalogItem[] | null> {
    const insuranceType = await this.findInsuranceTypeByCode(code);
    if (!insuranceType) {
      return null;
    }
    return this.prisma.coverage.findMany({
      where: { insuranceTypeId: insuranceType.id },
      select: { code: true, name: true },
      orderBy: { code: 'asc' },
    });
  }

  async findCoverageForType(insuranceTypeCode: string, coverageCode: string) {
    const insuranceType = await this.findInsuranceTypeByCode(insuranceTypeCode);
    if (!insuranceType) {
      return null;
    }
    return this.prisma.coverage.findUnique({
      where: {
        insuranceTypeId_code: { insuranceTypeId: insuranceType.id, code: coverageCode },
      },
    });
  }

  findAllLocations(): Promise<CatalogItem[]> {
    return this.prisma.location.findMany({
      select: { code: true, name: true },
      orderBy: { code: 'asc' },
    });
  }

  findLocationByCode(code: string) {
    return this.prisma.location.findUnique({ where: { code } });
  }
}
