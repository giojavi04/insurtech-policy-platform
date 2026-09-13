'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { InertLink } from '@/components/ui/InertLink';
import { Modal } from '@/components/ui/Modal';
import { Pill } from '@/components/ui/Pill';
import { Spinner } from '@/components/ui/Spinner';
import { fieldControlWithIconClass, fieldGroupClass, fieldLabelClass } from '@/components/ui/control-styles';
import { AtGlyph, CubeGlyph, EyeGlyph, LockGlyph, WingGlyph } from '@/components/ui/icons';
import { authApi } from '@/lib/api/endpoints';
import { ApiError, toUserMessage } from '@/lib/api/problem-details';
import { useAuthStore } from '@/lib/store/auth.store';

interface LoginDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Contenido del diálogo de acceso, renderizado dentro del `Modal` sin cambios
 * (portal, trampa de foco, Escape, clic en fondo, bloqueo de scroll y
 * restauración del foco — ver #803). Aquí solo se reestilizan los hijos.
 * Obtiene un JWT real a través de `POST /auth/login`; la opción
 * "Recordar sesión" (D2) es opt-in y queda desmarcada por defecto.
 */
export function LoginDialog({ onSuccess, onCancel }: LoginDialogProps) {
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await authApi.login(email, password);
      setToken(accessToken);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? toUserMessage(err) : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onCancel} labelledBy="login-dialog-title">
      <div className="flex flex-col items-center gap-4">
        <Pill variant="ok">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
          AMBIENTE SEGURO • ENCRIPTACIÓN TLS 1.3
        </Pill>

        <div className="flex w-full flex-col gap-5 rounded-card bg-paper-raised p-7 shadow-lift">
          <div className="flex flex-col items-center gap-3 text-center">
            <WingGlyph className="h-12 w-12" />
            <h2 id="login-dialog-title" className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Ingreso a Plataforma
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              Acceso asegurado con token JWT y credenciales autorizadas.
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className={fieldGroupClass}>
              <label htmlFor="login-email" className={fieldLabelClass}>
                Correo electrónico
              </label>
              <div className="relative">
                <AtGlyph className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={fieldControlWithIconClass}
                />
              </div>
            </div>

            <div className={fieldGroupClass}>
              <label htmlFor="login-password" className={fieldLabelClass}>
                Contraseña
              </label>
              <div className="relative">
                <LockGlyph className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  id="login-password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={`${fieldControlWithIconClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-pressed={passwordVisible}
                  aria-controls="login-password"
                  aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  <EyeGlyph open={passwordVisible} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Spinner />}
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="flex items-start gap-2.5 rounded-control bg-lav p-3">
            <CubeGlyph className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-ink">Requerido para la emisión de pólizas vinculantes</p>
              <code className="w-fit rounded bg-lav-deep px-2 py-1 font-mono text-xs text-ink-soft">
                Header Authorization: Bearer &lt;token&gt;
              </code>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 text-center text-sm">
            <span className="text-ink-soft">¿Problemas de acceso o cuenta nueva?</span>
            <InertLink note="Soporte TI no disponible en este demo.">Contactar a Soporte TI</InertLink>
          </div>
        </div>

        <p className="font-mono text-xs text-ink-soft">
          SOC 2 Type II • ISO/IEC 27001 • ID: EC-SEC-9204
          <br />© 2026 Insurtech. Todos los derechos reservados.
        </p>
      </div>
    </Modal>
  );
}
