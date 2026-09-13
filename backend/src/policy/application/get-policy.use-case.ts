import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../common/problem-details/error-code.enum';
import { PolicyRepository } from '../infrastructure/policy.repository';
import type { PolicyResponseDto } from '../dto/policy-response.dto';
import { toPolicyResponseDto } from './policy.mapper';

@Injectable()
export class GetPolicyUseCase {
  constructor(private readonly policyRepository: PolicyRepository) {}

  async execute(id: string): Promise<PolicyResponseDto> {
    const policy = await this.policyRepository.findById(id);
    if (!policy) {
      throw new NotFoundException({
        code: ErrorCode.POLICY_NOT_FOUND,
        detail: `Policy '${id}' was not found.`,
      });
    }
    return toPolicyResponseDto(policy);
  }
}
