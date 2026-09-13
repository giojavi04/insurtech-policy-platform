import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginDialog } from './LoginDialog';
import { useAuthStore } from '@/lib/store/auth.store';

vi.mock('@/lib/api/endpoints', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

const { authApi } = await import('@/lib/api/endpoints');

describe('LoginDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null });
  });

  it('password field defaults masked, and the toggle flips type + aria-pressed', async () => {
    const user = userEvent.setup();
    render(<LoginDialog onSuccess={vi.fn()} onCancel={vi.fn()} />);

    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggle = screen.getByRole('button', { name: /mostrar contraseña/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('remember-me defaults unchecked and is passed through to setToken on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'jwt-token', tokenType: 'Bearer' });
    const onSuccess = vi.fn();

    render(<LoginDialog onSuccess={onSuccess} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'demo@libelulasoft.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Demo1234!');
    await user.click(screen.getByRole('button', { name: /^iniciar sesión$/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(useAuthStore.getState().token).toBe('jwt-token');
  });
});
