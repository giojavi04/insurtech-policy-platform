import type { Policy } from '../../generated/prisma/client';
import type { PolicyResponseDto } from '../dto/policy-response.dto';

export function toPolicyResponseDto(policy: Policy): PolicyResponseDto {
  return {
    id: policy.id,
    quoteId: policy.quoteId,
    status: policy.status,
    issuedAt: policy.issuedAt.toISOString(),
  };
}
