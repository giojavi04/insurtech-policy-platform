'use client';

import { useState, type ReactNode } from 'react';

interface InertLinkProps {
  children: ReactNode;
  className?: string;
  /** Sobrescribe la nota del demo, o omítela para usar el texto compartido por defecto. */
  note?: string;
}

/**
 * Un recurso con estilo de enlace pero sin navegación para elementos que
 * aparecen en los mockups pero que el contrato REST fijo no tiene endpoint
 * para (restablecimiento de contraseña, soporte informático, Ayuda). Siempre
 * es un `<button type="button">` — nunca un `<a href="#">`, que puede
 * navegar, mutar la URL o dar 404. Estructuralmente, un botón no puede.
 *
 * Al hacer clic muestra una nota explícita de "no disponible en este demo"
 * en lugar de no hacer nada: el silencio se lee como un fallo, una nota
 * explícita se lee como un límite deliberado y documentado del demo.
 */
export function InertLink({ children, className = '', note = 'No disponible en este demo.' }: InertLinkProps) {
  const [showNote, setShowNote] = useState(false);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        aria-disabled="true"
        onClick={() => setShowNote(true)}
        className={`text-brand font-semibold underline-offset-2 hover:underline ${className}`}
      >
        {children}
      </button>
      {showNote && (
        <p role="status" className="text-xs text-ink-soft">
          {note}
        </p>
      )}
    </span>
  );
}
