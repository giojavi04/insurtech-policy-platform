import { describe, expect, it } from 'vitest';
import { policyDigest, truncateDigest } from './digest';

const base = {
  id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  quoteId: 'quote-1',
  status: 'ACTIVE',
  issuedAt: '2026-09-10T01:00:00.000Z',
};

describe('policyDigest', () => {
  it('produces the same 64-char hex digest for identical policy content', async () => {
    const a = await policyDigest(base);
    const b = await policyDigest({ ...base });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces a different digest when any field differs (proves a real computation)', async () => {
    const a = await policyDigest(base);
    const b = await policyDigest({ ...base, status: 'CANCELLED' });
    const c = await policyDigest({ ...base, id: 'different-id' });
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
    expect(b).not.toBe(c);
  });
});

describe('truncateDigest', () => {
  it('keeps the first 4 and last 7 hex characters joined by an ellipsis', () => {
    const hex = '8f9bc1a2d3e4f5061728394ab5c6d7e8f9a0b1c2d3e4f5061728394ab531e2a90';
    expect(truncateDigest(hex)).toBe(`${hex.slice(0, 4)}…${hex.slice(-7)}`);
    expect(truncateDigest(hex)).toMatch(/^8f9b…[0-9a-f]{7}$/);
  });
});
