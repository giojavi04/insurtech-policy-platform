import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IssuePolicyUseCase } from './issue-policy.use-case';
import type { QuoteLookupPort } from '../ports/quote-lookup.port';
import type { PolicyRepository } from '../infrastructure/policy.repository';

describe('IssuePolicyUseCase', () => {
  let quoteLookup: QuoteLookupPort;
  let policyRepository: PolicyRepository;
  let useCase: IssuePolicyUseCase;

  beforeEach(() => {
    quoteLookup = { findById: vi.fn() };
    policyRepository = { create: vi.fn(), findById: vi.fn() } as unknown as PolicyRepository;
    useCase = new IssuePolicyUseCase(quoteLookup, policyRepository);
  });

  it('throws 404 QUOTE_NOT_FOUND when the quote lookup port returns null, and never persists a policy', async () => {
    vi.mocked(quoteLookup.findById).mockResolvedValue(null);

    await expect(useCase.execute('missing-quote-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(policyRepository.create).not.toHaveBeenCalled();
  });

  it('issues a policy for an existing quote via the port only (never a Quote repository)', async () => {
    vi.mocked(quoteLookup.findById).mockResolvedValue({
      id: 'quote-1',
      status: 'QUOTED',
      estimatedPremium: '350.00',
    });
    vi.mocked(policyRepository.create).mockResolvedValue({
      id: 'policy-1',
      quoteId: 'quote-1',
      status: 'ACTIVE',
      issuedAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as never);

    const result = await useCase.execute('quote-1');

    expect(quoteLookup.findById).toHaveBeenCalledWith('quote-1');
    expect(policyRepository.create).toHaveBeenCalledWith('quote-1');
    expect(result).toEqual({
      id: 'policy-1',
      quoteId: 'quote-1',
      status: 'ACTIVE',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
