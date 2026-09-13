import { describe, expect, it } from 'vitest';
import { BASE, COVERAGE_RATE, LOCATION_RATE } from '../src/domain/premium/premium.tables';
import { COVERAGES_BY_TYPE, INSURANCE_TYPES, LOCATION_NAMES } from './seed-data';

describe('seed data vs. rating tables', () => {
  it('seeds every insurance type present in the BASE rating table', () => {
    const seededCodes = new Set(INSURANCE_TYPES.map((type) => type.code));
    for (const code of Object.keys(BASE)) {
      expect(seededCodes.has(code as keyof typeof BASE)).toBe(true);
    }
  });

  it('seeds every coverage code present in the COVERAGE_RATE table for at least one type', () => {
    const seededCoverageCodes = new Set(Object.values(COVERAGES_BY_TYPE).flat());
    for (const code of Object.keys(COVERAGE_RATE)) {
      expect(seededCoverageCodes.has(code as keyof typeof COVERAGE_RATE)).toBe(true);
    }
  });

  it('seeds every location code present in the LOCATION_RATE table', () => {
    for (const code of Object.keys(LOCATION_RATE)) {
      expect(code in LOCATION_NAMES).toBe(true);
    }
  });

  it('HOGAR deliberately excludes PREMIUM coverage (fixture for the mismatch validation case)', () => {
    expect(COVERAGES_BY_TYPE.HOGAR).not.toContain('PREMIUM');
    expect(COVERAGES_BY_TYPE.AUTO).toContain('PREMIUM');
    expect(COVERAGES_BY_TYPE.SALUD).toContain('PREMIUM');
  });

  it('includes EC-AZUAY among seeded locations', () => {
    expect(LOCATION_NAMES['EC-AZUAY']).toBeDefined();
  });
});
