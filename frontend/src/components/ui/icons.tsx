interface GlyphProps {
  className?: string;
}

/**
 * Marca original de la identidad: un mosaico redondeado en color teal con una
 * ala estilizada blanca — dos arcos reflejados que se unen en un punto.
 * Solo decorativa, `aria-hidden`, y explícitamente NO es una reproducción de
 * ningún activo real de un asegurador.
 */
export function WingGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={className}>
      <rect width="40" height="40" rx="10" fill="var(--color-brand)" />
      <path
        d="M20 11 C15 15 9 18 5 19.5 C9 21 15 24 20 29 C25 24 31 21 35 19.5 C31 18 25 15 20 11 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** Triángulo de advertencia para errores de campo y banners. Siempre acompañado de texto y nunca usado solo. */
export function WarnGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M8 1.8 L15 14.2 H1 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6.1 V9.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.9" r="0.95" fill="currentColor" />
    </svg>
  );
}

/** Paso completado / marca de éxito. */
export function CheckGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M3.6 8.4 L6.6 11.4 L12.4 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Icono inicial para el campo de correo. */
export function AtGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8.1" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10.5 8.1 V9.2 C10.5 10.3 11.5 10.9 12.4 10.4 C13.3 9.9 13.8 8.7 13.8 7.2 C13.8 4.3 11.4 2.1 8.2 2.1 C4.9 2.1 2.3 4.6 2.3 8 C2.3 11.3 4.8 13.8 8 13.8 C9.1 13.8 10.1 13.5 10.9 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Icono inicial para el campo de contraseña. */
export function LockGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <rect x="2.6" y="7" width="10.8" height="7.2" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5 7 V4.8 A3 3 0 0 1 11 4.8 V7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** Alternador de visibilidad de contraseña. `open` controla la variante tachada. */
export function EyeGlyph({ className, open }: GlyphProps & { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M1.4 8 C2.8 5 5.2 3.3 8 3.3 C10.8 3.3 13.2 5 14.6 8 C13.2 11 10.8 12.7 8 12.7 C5.2 12.7 2.8 11 1.4 8 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      {!open && <path d="M2 13.6 L14 2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />}
    </svg>
  );
}

/** Glifo de insignia de confianza o seguridad — identidad de navegación, píldora de seguridad de acceso y pie de confianza. */
export function ShieldGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M8 1.6 L13.6 3.6 V7.6 C13.6 11 11.2 13.4 8 14.4 C4.8 13.4 2.4 11 2.4 7.6 V3.6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M5.6 8.2 L7.3 9.9 L10.6 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Glifo de caja informativa de token Bearer. */
export function CubeGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M8 1.6 L14 4.6 V11.4 L8 14.4 L2 11.4 V4.6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M2 4.6 L8 7.6 L14 4.6 M8 7.6 V14.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Icono del tipo de cobertura "Auto". */
export function CarGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M4 15.5 L5.4 10.2 C5.7 9 6.8 8.2 8.1 8.2 H15.9 C17.2 8.2 18.3 9 18.6 10.2 L20 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="15.5" width="18" height="4.3" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.3" cy="19.8" r="1.3" fill="currentColor" />
      <circle cx="16.7" cy="19.8" r="1.3" fill="currentColor" />
    </svg>
  );
}

/** Icono del tipo de cobertura "Salud". */
export function HeartGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M12 20.2 C7.6 16.9 4 13.8 4 9.8 C4 7.2 6 5.4 8.4 5.4 C9.9 5.4 11.2 6.1 12 7.3 C12.8 6.1 14.1 5.4 15.6 5.4 C18 5.4 20 7.2 20 9.8 C20 13.8 16.4 16.9 12 20.2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Icono del tipo de cobertura "Hogar". */
export function HomeGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M4 11.5 L12 4.5 L20 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.3 10 V19 H17.7 V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="10" y="13.4" width="4" height="5.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Icono inicial para el campo de edad. */
export function UserGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <circle cx="8" cy="5.2" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.6 13.6 C3 10.6 5.2 9 8 9 C10.8 9 13 10.6 13.4 13.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Icono inicial para el campo de ubicación. */
export function PinGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M8 14.4 C8 14.4 13 10.3 13 6.4 C13 3.7 10.8 1.6 8 1.6 C5.2 1.6 3 3.7 3 6.4 C3 10.3 8 14.4 8 14.4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.4" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Glifo de acción de copia al portapapeles. */
export function CopyGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <rect x="5.4" y="5.4" width="9" height="9" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.5 10.4 H2.6 A1.2 1.2 0 0 1 1.4 9.2 V2.6 A1.2 1.2 0 0 1 2.6 1.4 H9.2 A1.2 1.2 0 0 1 10.4 2.6 V3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

/** Glifo de acción de descarga PDF. */
export function DownloadGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path d="M8 1.8 V9.8 M4.8 6.8 L8 10 L11.2 6.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.4 11.6 V13 A1.2 1.2 0 0 0 3.6 14.2 H12.4 A1.2 1.2 0 0 0 13.6 13 V11.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Glifo de teléfono/contacto para el bloque de soporte de reclamos. */
export function PhoneGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M3.3 2.6 L5.6 2.6 L6.6 5.4 L5.1 6.5 C5.7 8 6.9 9.4 8.4 10 L9.4 8.4 L12.3 9.4 V11.8 C12.3 12.8 11.4 13.5 10.4 13.3 C6.1 12.5 3.1 9.6 2.3 5.5 C2.1 4.5 2.9 3.6 3.3 2.6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Glifo de asistencia vial / llave inglesa usado en una caja de cobertura. */
export function WrenchGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M10.4 2.4 A3.2 3.2 0 0 0 6.9 6.8 L2 11.7 L4.3 14 L9.2 9.1 A3.2 3.2 0 0 0 13.6 5.6 L11.4 7.8 L9.4 6.6 L8.2 4.6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Glifo de correo para el bloque de confirmación de envío de certificado. */
export function MailGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      <rect x="1.6" y="3.4" width="12.8" height="9.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.2 4.2 L8 8.6 L13.8 4.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
