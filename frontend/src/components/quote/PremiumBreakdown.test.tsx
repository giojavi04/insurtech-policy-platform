import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PremiumBreakdown } from './PremiumBreakdown';

describe('PremiumBreakdown', () => {
  it('renders every breakdown row and the total estimated premium', () => {
    render(
      <PremiumBreakdown
        estimatedPremium="350.00"
        breakdown={[
          { concept: 'BASE', amount: '200.00' },
          { concept: 'AGE_FACTOR', amount: '60.00' },
          { concept: 'LOCATION_FACTOR', amount: '40.00' },
          { concept: 'COVERAGE_FACTOR', amount: '50.00' },
        ]}
      />,
    );

    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('200.00')).toBeInTheDocument();
    expect(screen.getByText('Factor de edad')).toBeInTheDocument();
    expect(screen.getByText('60.00')).toBeInTheDocument();
    expect(screen.getByText('Factor de ubicación')).toBeInTheDocument();
    expect(screen.getByText('40.00')).toBeInTheDocument();
    expect(screen.getByText('Factor de cobertura')).toBeInTheDocument();
    expect(screen.getByText('Prima estimada')).toBeInTheDocument();
    expect(screen.getByText('350.00')).toBeInTheDocument();
  });

  it('renders no rows for an empty breakdown without crashing', () => {
    render(<PremiumBreakdown estimatedPremium="0.00" breakdown={[]} />);

    expect(screen.getByText('Prima estimada')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });
});
