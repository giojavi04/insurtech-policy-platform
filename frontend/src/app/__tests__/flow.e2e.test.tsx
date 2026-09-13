import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQuoteStore } from '@/lib/store/quote.store';

const push = vi.fn();

// PageShell deriva la posición del carril FlowState desde la ruta, por eso
// el mock compartido de next/navigation debe exponer usePathname junto con
// useRouter.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}));

vi.mock('@/lib/api/endpoints', () => ({
  catalogsApi: {
    listInsuranceTypes: vi.fn(),
    listCoverages: vi.fn(),
    listLocations: vi.fn(),
  },
  quotesApi: {
    create: vi.fn(),
    get: vi.fn(),
  },
  authApi: {
    login: vi.fn(),
  },
  policiesApi: {
    issue: vi.fn(),
    get: vi.fn(),
  },
}));

const { catalogsApi, quotesApi, authApi, policiesApi } = await import('@/lib/api/endpoints');
const HomePage = (await import('@/app/page')).default;
const PolicyPage = (await import('@/app/policies/[id]/page')).default;

const QUOTE = {
  id: 'quote-1',
  status: 'QUOTED',
  inputs: { insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' },
  estimatedPremium: '350.00',
  breakdown: [
    { concept: 'BASE', amount: '200.00' },
    { concept: 'AGE_FACTOR', amount: '60.00' },
    { concept: 'LOCATION_FACTOR', amount: '40.00' },
    { concept: 'COVERAGE_FACTOR', amount: '50.00' },
  ],
  createdAt: '2026-09-10T00:00:00.000Z',
};

// cabecera {"alg":"HS256","typ":"JWT"} + payload {"email":"demo@libelulasoft.com"} — solo decodificación,
// nunca verificado en el cliente; ver lib/auth/jwt.ts.
const DEMO_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRlbW9AbGliZWx1bGFzb2Z0LmNvbSJ9.sig';

const POLICY = {
  id: 'policy-1',
  quoteId: 'quote-1',
  status: 'ACTIVE',
  issuedAt: '2026-09-10T01:00:00.000Z',
};

describe('quote -> bind end-to-end flow (mocked API client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    useAuthStore.setState({ token: null });
    useQuoteStore.setState({ lastQuote: null, lastPolicyId: null });

    vi.mocked(catalogsApi.listInsuranceTypes).mockResolvedValue({
      items: [{ code: 'AUTO', name: 'Seguro de Auto' }],
    });
    vi.mocked(catalogsApi.listLocations).mockResolvedValue({
      items: [{ code: 'EC-AZUAY', name: 'Azuay' }],
    });
    vi.mocked(catalogsApi.listCoverages).mockResolvedValue({
      items: [{ code: 'PREMIUM', name: 'Cobertura Premium' }],
    });
    vi.mocked(quotesApi.create).mockResolvedValue(QUOTE);
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: DEMO_JWT, tokenType: 'Bearer' });
    vi.mocked(policiesApi.issue).mockResolvedValue(POLICY);
    vi.mocked(policiesApi.get).mockResolvedValue(POLICY);
  });

  it('loads catalogs, debounces a live quote (D1), logs in, confirms issuance, and shows the policy confirmation', async () => {
    const user = userEvent.setup();

    // 1. Load catalogs and fill in the quote form — D1 removed the "Cotizar"
    // submit button; the sidebar owns debouncing and the real POST /quotes.
    render(<HomePage />);
    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: /seguro de auto/i }));
    const premiumRadio = await screen.findByRole('radio', { name: /cobertura premium/i });
    await user.click(premiumRadio);
    await user.type(screen.getByLabelText(/edad del asegurado/i), '35');
    await user.selectOptions(screen.getByLabelText(/provincia \/ región/i), 'EC-AZUAY');

    // 2. D1 — the sidebar debounces ~500ms after the last field change before
    // firing the real POST /quotes. Advance fake timers instead of a click.
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(500);
    vi.useRealTimers();

    await waitFor(() =>
      expect(quotesApi.create).toHaveBeenCalledWith({
        insuranceType: 'AUTO',
        coverage: 'PREMIUM',
        age: 35,
        location: 'EC-AZUAY',
      }),
    );
    expect(await screen.findByText('En Tiempo Real')).toBeInTheDocument();
    expect(useQuoteStore.getState().lastQuote).toEqual(QUOTE);

    // Issuance is hidden/disabled without a session.
    expect(screen.getByText(/debes iniciar sesión/i)).toBeInTheDocument();

    // 3. Log in. Remember-me (D2) defaults unchecked.
    await user.click(screen.getByRole('button', { name: /iniciar sesión para emitir póliza/i }));
    const loginDialog = screen.getByRole('dialog', { name: /ingreso a plataforma/i });
    await user.type(within(loginDialog).getByLabelText(/correo electrónico/i), 'demo@libelulasoft.com');
    await user.type(within(loginDialog).getByLabelText(/^contraseña$/i), 'Demo1234!');
    await user.click(within(loginDialog).getByRole('button', { name: /^iniciar sesión$/i }));

    await waitFor(() => expect(useAuthStore.getState().token).toBe(DEMO_JWT));

    // 4. Explicit confirmation before bind.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /confirmar y emitir póliza/i })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: /confirmar y emitir póliza/i }));

    await waitFor(() => expect(policiesApi.issue).toHaveBeenCalledWith('quote-1'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/policies/policy-1'));

    // 5. View the policy confirmation — real digest, derived expiry, JWT-decoded
    // identity (no Documento/Cédula row — the contract has no national ID field).
    render(<PolicyPage params={{ id: 'policy-1' }} />);
    await waitFor(() => expect(policiesApi.get).toHaveBeenCalledWith('policy-1'));
    expect(await screen.findByText('policy-1')).toBeInTheDocument();
    expect(screen.getByText(/status: active/i)).toBeInTheDocument();
    // The nav identity avatar also renders the email, so the policy screen's
    // titular block is expected to be the *second* occurrence.
    expect(screen.getAllByText('demo@libelulasoft.com').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/documento\s*\/\s*c[eé]dula/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/^[0-9a-f]{4}…[0-9a-f]{7}$/)).toBeInTheDocument();
    expect(screen.getByText(/vigencia anual \(calculada\)/i)).toBeInTheDocument();
  });
});
