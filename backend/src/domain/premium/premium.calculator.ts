import Decimal from 'decimal.js';
import { BASE, COVERAGE_RATE, findAgeBracket, LOCATION_RATE } from './premium.tables';
import type { PremiumBreakdownItem, PremiumInput, PremiumResult } from './premium.types';

/**
 * Pure, IO-free premium calculation.
 *
 * total = BASE[type] x (1 + AGE_RATE + LOCATION_RATE + COVERAGE_RATE)
 *
 * Each additive component (BASE, AGE_FACTOR, LOCATION_FACTOR,
 * COVERAGE_FACTOR) is rounded half-up to 2 decimal places *before* summing,
 * so `estimatedPremium` always equals the exact sum of the displayed
 * breakdown — never a rounding of the raw total.
 */
export function calculatePremium(input: PremiumInput): PremiumResult {
  const base = new Decimal(BASE[input.insuranceType]);

  const ageBracket = findAgeBracket(input.age);
  if (!ageBracket) {
    throw new Error(`No age bracket configured for age ${input.age}`);
  }

  const roundComponent = (rate: number): string =>
    base.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);

  const breakdown: PremiumBreakdownItem[] = [
    { concept: 'BASE', amount: base.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2) },
    { concept: 'AGE_FACTOR', amount: roundComponent(ageBracket.rate) },
    { concept: 'LOCATION_FACTOR', amount: roundComponent(LOCATION_RATE[input.location]) },
    { concept: 'COVERAGE_FACTOR', amount: roundComponent(COVERAGE_RATE[input.coverage]) },
  ];

  const estimatedPremium = breakdown
    .reduce((acc, item) => acc.plus(item.amount), new Decimal(0))
    .toFixed(2);

  return { estimatedPremium, breakdown };
}
