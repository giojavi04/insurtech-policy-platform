import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth.store';

const KEY = 'lsp.auth.token';

/**
 * D2 — opt-in de "Recordar sesión en este equipo". La lectura/escritura manual
 * de localStorage está protegida por el flag `remember` (no por `persist` de
 * zustand, que seguiría escribiendo una entrada aunque `partialize` estuviera
 * vacío — ver design ADR).
 */
describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null });
  });

  it('setToken stores the token in memory', () => {
    useAuthStore.getState().setToken('jwt-token');
    expect(useAuthStore.getState().token).toBe('jwt-token');
  });

  it('clearToken clears the in-memory token', () => {
    useAuthStore.getState().setToken('jwt-token');
    useAuthStore.getState().clearToken();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
