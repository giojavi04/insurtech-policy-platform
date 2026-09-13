import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LivePricingSidebar } from './LivePricingSidebar';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQuoteStore } from '@/lib/store/quote.store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api/endpoints', () => ({
  quotesApi: {
    create: vi.fn(),
  },
}));

const { quotesApi } = await import('@/lib/api/endpoints');

const VALID_VALUES = { insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' };

const QUOTE = {
  id: 'quote-1',
  status: 'QUOTED',
  inputs: { insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' },
  estimatedPremium: '350.00',
  breakdown: [{ concept: 'BASE', amount: '200.00' }],
  createdAt: '2026-09-10T00:00:00.000Z',
};

describe('LivePricingSidebar (D1 — debounced live pricing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null, remember: false });
    useQuoteStore.setState({ lastQuote: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('idle: renders a muted placeholder and a disabled CTA when the form is incomplete', () => {
    render(<LivePricingSidebar values={{}} />);

    expect(screen.getByText('Completa los datos para ver tu cuota')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /emitir póliza inmediata/i })).toBeDisabled();
    expect(quotesApi.create).not.toHaveBeenCalled();
  });

  it('loading -> ready: fires the debounced POST /quotes and renders the real breakdown once resolved', async () => {
    let resolveQuote!: (value: typeof QUOTE) => void;
    vi.mocked(quotesApi.create).mockReturnValue(
      new Promise((resolve) => {
        resolveQuote = resolve;
      }),
    );
    useAuthStore.setState({ token: 'jwt-token', remember: false });

    vi.useFakeTimers();
    render(<LivePricingSidebar values={VALID_VALUES} />);

    await vi.advanceTimersByTimeAsync(500);
    expect(quotesApi.create).toHaveBeenCalledWith({
      insuranceType: 'AUTO',
      coverage: 'PREMIUM',
      age: 35,
      location: 'EC-AZUAY',
    });
    expect(screen.getByText('Actualizando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /emitir póliza inmediata/i })).toBeDisabled();

    resolveQuote(QUOTE);
    await vi.advanceTimersByTimeAsync(0);
    vi.useRealTimers();

    expect(await screen.findByText('En Tiempo Real')).toBeInTheDocument();
    expect(screen.getByText('350.00')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^emitir póliza inmediata/i })).not.toBeDisabled();
  });

  it('error: renders a retryable-looking banner and keeps the CTA disabled', async () => {
    vi.mocked(quotesApi.create).mockRejectedValue(new Error('down'));

    vi.useFakeTimers();
    render(<LivePricingSidebar values={VALID_VALUES} />);
    await vi.advanceTimersByTimeAsync(500);
    vi.useRealTimers();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /emitir póliza inmediata/i })).toBeDisabled();
  });

  it('discards a stale response when a newer request resolves first (request-id guard)', async () => {
    const firstQuote = { ...QUOTE, id: 'quote-stale', estimatedPremium: '111.00' };
    const secondQuote = { ...QUOTE, id: 'quote-fresh', estimatedPremium: '222.00' };
    let resolveFirst!: (value: typeof QUOTE) => void;
    let resolveSecond!: (value: typeof QUOTE) => void;
    vi.mocked(quotesApi.create)
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)))
      .mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)));

    vi.useFakeTimers();
    const { rerender } = render(<LivePricingSidebar values={VALID_VALUES} />);
    await vi.advanceTimersByTimeAsync(500);

    rerender(<LivePricingSidebar values={{ ...VALID_VALUES, age: 36 }} />);
    await vi.advanceTimersByTimeAsync(500);

    // Resolve the newer (second) request first, then the stale (first) one.
    resolveSecond(secondQuote);
    await vi.advanceTimersByTimeAsync(0);
    resolveFirst(firstQuote);
    await vi.advanceTimersByTimeAsync(0);
    vi.useRealTimers();

    expect(await screen.findByText('222.00')).toBeInTheDocument();
    expect(screen.queryByText('111.00')).not.toBeInTheDocument();
  });
});
