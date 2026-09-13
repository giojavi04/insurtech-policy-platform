import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { PremiumBreakdownItem } from '../../domain/premium/premium.types';

const QUOTE_INCLUDE = {
  insuranceType: true,
  coverage: true,
  location: true,
} satisfies Prisma.QuoteInclude;

export type QuoteWithRelations = Prisma.QuoteGetPayload<{ include: typeof QUOTE_INCLUDE }>;

export interface CreateQuoteParams {
  insuranceTypeCode: string;
  coverageCode: string;
  locationCode: string;
  age: number;
  estimatedPremium: string;
  breakdown: PremiumBreakdownItem[];
}

@Injectable()
export class QuoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateQuoteParams): Promise<QuoteWithRelations> {
    const [insuranceType, location] = await Promise.all([
      this.prisma.insuranceType.findUniqueOrThrow({ where: { code: params.insuranceTypeCode } }),
      this.prisma.location.findUniqueOrThrow({ where: { code: params.locationCode } }),
    ]);
    const coverage = await this.prisma.coverage.findUniqueOrThrow({
      where: {
        insuranceTypeId_code: { insuranceTypeId: insuranceType.id, code: params.coverageCode },
      },
    });

    return this.prisma.quote.create({
      data: {
        insuranceTypeId: insuranceType.id,
        coverageId: coverage.id,
        locationId: location.id,
        age: params.age,
        estimatedPremium: params.estimatedPremium,
        breakdown: params.breakdown as unknown as Prisma.InputJsonValue,
      },
      include: QUOTE_INCLUDE,
    });
  }

  findById(id: string): Promise<QuoteWithRelations | null> {
    return this.prisma.quote.findUnique({ where: { id }, include: QUOTE_INCLUDE });
  }
}
