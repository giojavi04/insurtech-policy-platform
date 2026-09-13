import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageShell } from './PageShell';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQuoteStore } from '@/lib/store/quote.store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('PageShell — "Mis Pólizas" nav tab', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null });
    useQuoteStore.setState({ lastQuote: null, lastPolicyId: null });
  });

  it('renders an aria-disabled inert button with no lastPolicyId, never a dead link', () => {
    render(
      <PageShell>
        <p>content</p>
      </PageShell>,
    );

    const tab = screen.getByRole('button', { name: /mis pólizas/i });
    expect(tab).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('link', { name: /mis pólizas/i })).not.toBeInTheDocument();
    expect(screen.getByText('Sin pólizas aún')).toBeInTheDocument();
  });

  it('renders a real link to the most recent policy once lastPolicyId is set', () => {
    useQuoteStore.setState({ lastPolicyId: 'policy-42' });

    render(
      <PageShell>
        <p>content</p>
      </PageShell>,
    );

    const tab = screen.getByRole('link', { name: /mis pólizas/i });
    expect(tab).toHaveAttribute('href', '/policies/policy-42');
    expect(screen.queryByRole('button', { name: /mis pólizas/i })).not.toBeInTheDocument();
  });
});
