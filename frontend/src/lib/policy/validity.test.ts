import { describe, expect, it } from 'vitest';
import { computeExpiry } from './validity';

describe('computeExpiry', () => {
  it('adds exactly one year to a regular issue date', () => {
    const expiry = computeExpiry('2026-02-26T18:42:01.109Z');
    expect(expiry.getUTCFullYear()).toBe(2027);
    expect(expiry.getUTCMonth()).toBe(1); // February (0-indexed)
    expect(expiry.getUTCDate()).toBe(26);
  });

  it('handles a Feb-29 leap-year issue date honestly (rolls to Mar 1 the following non-leap year)', () => {
    const expiry = computeExpiry('2028-02-29T00:00:00.000Z');
    expect(expiry.getUTCFullYear()).toBe(2029);
    expect(expiry.getUTCMonth()).toBe(2); // March
    expect(expiry.getUTCDate()).toBe(1);
  });
});
