import { describe, expect, it } from 'vitest';
import { calculatePremium } from './premium.calculator';
import { AGE_BRACKETS, BASE, COVERAGE_RATE, LOCATION_RATE } from './premium.tables';
import type { CoverageCode, InsuranceTypeCode, LocationCode } from './premium.types';

describe('calculatePremium', () => {
  it('reproduces the documented worked example exactly (AUTO/PREMIUM/35/EC-AZUAY)', () => {
    const result = calculatePremium({
      insuranceType: 'AUTO',
      coverage: 'PREMIUM',
      age: 35,
      location: 'EC-AZUAY',
    });

    expect(result.breakdown).toEqual([
      { concept: 'BASE', amount: '200.00' },
      { concept: 'AGE_FACTOR', amount: '60.00' },
      { concept: 'LOCATION_FACTOR', amount: '40.00' },
      { concept: 'COVERAGE_FACTOR', amount: '50.00' },
    ]);
    expect(result.estimatedPremium).toBe('350.00');
  });

  it('is deterministic: identical inputs produce byte-identical results', () => {
    const input = {
      insuranceType: 'SALUD' as InsuranceTypeCode,
      coverage: 'ESTANDAR' as CoverageCode,
      age: 42,
      location: 'EC-GUAYAS' as LocationCode,
    };

    const first = calculatePremium(input);
    const second = calculatePremium(input);

    expect(first).toEqual(second);
  });

  it('rounds each component to 2 decimal places before summing', () => {
    // La base de HOGAR es 120.00, con una tasa de ubicación de 0.15 y una
    // de cobertura de 0.12; eso produce centavos fraccionales si se calcula
    // con floats sin redondear cada componente antes.
    const result = calculatePremium({
      insuranceType: 'HOGAR',
      coverage: 'ESTANDAR',
      age: 20,
      location: 'EC-LOJA',
    });

    for (const item of result.breakdown) {
      expect(item.amount).toMatch(/^\d+\.\d{2}$/);
    }

    const sum = result.breakdown.reduce((acc, item) => acc + Number(item.amount), 0);
    expect(result.estimatedPremium).toBe(sum.toFixed(2));
  });

  const insuranceTypes: InsuranceTypeCode[] = ['AUTO', 'SALUD', 'HOGAR'];
  const coverages: CoverageCode[] = ['BASICA', 'ESTANDAR', 'PREMIUM'];
  const locations: LocationCode[] = Object.keys(LOCATION_RATE) as LocationCode[];

  it.each(
    insuranceTypes.flatMap((insuranceType) =>
      coverages.flatMap((coverage) =>
        locations.map((location) => ({ insuranceType, coverage, location })),
      ),
    ),
  )(
    'estimatedPremium equals the sum of breakdown amounts for $insuranceType/$coverage/$location',
    ({ insuranceType, coverage, location }) => {
      const result = calculatePremium({ insuranceType, coverage, age: 30, location });
      const sum = result.breakdown.reduce((acc, item) => acc + Number(item.amount), 0);
      expect(Number(result.estimatedPremium)).toBeCloseTo(sum, 2);
    },
  );

  it.each(AGE_BRACKETS)('accepts every documented age bracket ($min-$max)', (bracket) => {
    const result = calculatePremium({
      insuranceType: 'AUTO',
      coverage: 'BASICA',
      age: bracket.min,
      location: 'EC-AZUAY',
    });
    const expectedAgeFactor = (BASE.AUTO * bracket.rate).toFixed(2);
    const ageFactor = result.breakdown.find((item) => item.concept === 'AGE_FACTOR');
    expect(ageFactor?.amount).toBe(expectedAgeFactor);
  });

  it('COVERAGE_FACTOR is zero for BASICA coverage', () => {
    const result = calculatePremium({
      insuranceType: 'AUTO',
      coverage: 'BASICA',
      age: 30,
      location: 'EC-AZUAY',
    });
    const coverageFactor = result.breakdown.find((item) => item.concept === 'COVERAGE_FACTOR');
    expect(coverageFactor?.amount).toBe((BASE.AUTO * COVERAGE_RATE.BASICA).toFixed(2));
  });

  it('throws for an age outside every documented bracket', () => {
    expect(() =>
      calculatePremium({
        insuranceType: 'AUTO',
        coverage: 'BASICA',
        age: 17,
        location: 'EC-AZUAY',
      }),
    ).toThrow();
  });
});
