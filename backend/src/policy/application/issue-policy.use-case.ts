import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../common/problem-details/error-code.enum';
import { PolicyRepository } from '../infrastructure/policy.repository';
import { QUOTE_LOOKUP, type QuoteLookupPort } from '../ports/quote-lookup.port';
import type { PolicyResponseDto } from '../dto/policy-response.dto';
import { toPolicyResponseDto } from './policy.mapper';

@Injectable()
export class IssuePolicyUseCase {
  constructor(
    @Inject(QUOTE_LOOKUP) private readonly quoteLookup: QuoteLookupPort,
    private readonly policyRepository: PolicyRepository,
  ) {}

  async execute(quoteId: string): Promise<PolicyResponseDto> {
    // El puerto es la única dependencia de PolicyModule hacia Quote; eso
    // demuestra que el límite del módulo se mantiene incluso dentro del mismo
    // proceso (diseño D1/D2).
    const quote = await this.quoteLookup.findById(quoteId);
    if (!quote) {
      throw new NotFoundException({
        code: ErrorCode.QUOTE_NOT_FOUND,
        detail: `Quote '${quoteId}' was not found.`,
      });
    }

    // Una llamada duplicada concurrente para el mismo quoteId pierde la
    // carrera de restricción única de la base de datos y aparece como
    // Prisma P2002, mapeada a 409 por el filtro global ProblemDetailsFilter.
    const policy = await this.policyRepository.create(quoteId);
    return toPolicyResponseDto(policy);
  }
}
