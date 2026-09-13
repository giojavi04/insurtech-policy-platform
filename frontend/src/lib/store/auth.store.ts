import { create } from 'zustand';

// D2 — "Recordar sesión en este equipo" es opt-in. La lectura/escritura
// manual de localStorage queda protegida por `remember`, no por el middleware
// `persist` de zustand: `persist` escribe su entrada incluso cuando
// `partialize` devuelve vacío, así que una casilla no marcada dejaría huella.
// El valor por defecto es solo memoria, exactamente el comportamiento anterior;
// un recargo de página siempre requiere un login nuevo salvo que el usuario
// haya optado explícitamente al iniciar sesión.
const STORAGE_KEY = 'lsp.auth.token';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => {
    set({ token });
  },
  clearToken: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Navegación privada / almacenamiento deshabilitado: no hay nada que limpiar.
    }
    set({ token: null});
  },
}));
