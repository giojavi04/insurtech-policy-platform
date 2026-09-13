import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuoteForm } from './QuoteForm';

// D1 — QuoteForm ya no envía el formulario (aquí no hay llamada a
// `quotesApi.create` en absoluto): la barra lateral de precio en vivo
// se encarga del debounce, la validación y el POST real.
vi.mock('@/lib/api/endpoints', () => ({
  catalogsApi: {
    listInsuranceTypes: vi.fn(),
    listCoverages: vi.fn(),
    listLocations: vi.fn(),
  },
}));

const { catalogsApi } = await import('@/lib/api/endpoints');

const insuranceTypes = {
  items: [
    { code: 'AUTO', name: 'Seguro de Auto' },
    { code: 'HOGAR', name: 'Seguro de Hogar' },
  ],
};
const locations = { items: [{ code: 'EC-AZUAY', name: 'Azuay' }] };
const autoCoverages = {
  items: [
    { code: 'BASICA', name: 'Cobertura Básica' },
    { code: 'PREMIUM', name: 'Cobertura Premium' },
  ],
};

describe('QuoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogsApi.listInsuranceTypes).mockResolvedValue(insuranceTypes);
    vi.mocked(catalogsApi.listLocations).mockResolvedValue(locations);
    vi.mocked(catalogsApi.listCoverages).mockResolvedValue(autoCoverages);
  });

  it('loads catalogs and renders insurance-type tiles as an accessible radiogroup', async () => {
    render(<QuoteForm />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());
    expect(screen.getByRole('radio', { name: /seguro de auto/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /seguro de hogar/i })).toBeInTheDocument();
    expect(screen.getByText('Selecciona primero un tipo de seguro.')).toBeInTheDocument();
  });

  it('never renders a "Cotizar" submit button — the CTA lives in the live pricing sidebar', async () => {
    render(<QuoteForm />);
    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /cotizar/i })).not.toBeInTheDocument();
  });

  it('fetches coverages and renders them as radio tiles only after an insurance type is selected', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());
    expect(catalogsApi.listCoverages).not.toHaveBeenCalled();

    await user.click(screen.getByRole('radio', { name: /seguro de auto/i }));

    await waitFor(() => expect(catalogsApi.listCoverages).toHaveBeenCalledWith('AUTO'));
    expect(await screen.findByRole('radio', { name: /cobertura premium/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /cobertura básica/i })).toBeInTheDocument();
  });

  it('selecting a coverage radio tile by its accessible name checks the underlying input', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());
    await user.click(screen.getByRole('radio', { name: /seguro de auto/i }));

    const premiumRadio = await screen.findByRole('radio', { name: /cobertura premium/i });
    await user.click(premiumRadio);

    expect(premiumRadio).toBeChecked();
  });

  it('streams every field change up via onValuesChange, without waiting for a submit', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(<QuoteForm onValuesChange={onValuesChange} />);

    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());
    await user.click(screen.getByRole('radio', { name: /seguro de auto/i }));

    const premiumRadio = await screen.findByRole('radio', { name: /cobertura premium/i });
    await user.click(premiumRadio);
    await user.type(screen.getByLabelText(/edad del asegurado/i), '35');
    await user.selectOptions(screen.getByLabelText(/provincia \/ región/i), 'EC-AZUAY');

    await waitFor(() =>
      expect(onValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          location: 'EC-AZUAY',
        }),
      ),
    );
    const lastCall = onValuesChange.mock.calls.at(-1)?.[0];
    expect(String(lastCall.age)).toBe('35');
  });

  it('shows a retryable error banner when catalogs fail to load', async () => {
    vi.mocked(catalogsApi.listInsuranceTypes).mockReset();
    vi.mocked(catalogsApi.listInsuranceTypes)
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(insuranceTypes);
    const user = userEvent.setup();

    render(<QuoteForm />);

    const retryButton = await screen.findByRole('button', { name: /reintentar/i });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(retryButton);

    await waitFor(() => expect(screen.getByRole('radiogroup', { name: /tipo de seguro/i })).toBeInTheDocument());
  });
});
