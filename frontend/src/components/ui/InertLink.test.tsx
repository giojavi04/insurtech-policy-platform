import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InertLink } from './InertLink';

describe('InertLink', () => {
  it('renders a <button>, never an <a>, so it is structurally incapable of navigating', () => {
    render(<InertLink>Contactar a Soporte TI</InertLink>);

    const link = screen.getByRole('button', { name: /contactar a soporte ti/i });
    expect(link.tagName).toBe('BUTTON');
    expect(link).toHaveAttribute('type', 'button');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
  });

  it('shows the default demo-boundary note on click instead of doing nothing', async () => {
    const user = userEvent.setup();
    render(<InertLink>Ayuda</InertLink>);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ayuda/i }));

    expect(screen.getByRole('status')).toHaveTextContent('No disponible en este demo.');
  });

  it('shows a caller-supplied note when provided', async () => {
    const user = userEvent.setup();
    render(<InertLink note="Soporte TI no disponible en este demo.">Contactar a Soporte TI</InertLink>);

    await user.click(screen.getByRole('button', { name: /contactar a soporte ti/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Soporte TI no disponible en este demo.');
  });
});
