import { useEffect, useState } from 'react';

/**
 * Debounce genérico: devuelve `value`, pero solo después de que hayan pasado
 * `delayMs` sin más cambios. Cada valor intermedio en una ráfaga rápida se
 * descarta; solo sobrevive el último al cerrar la ventana. Alimenta la
 * barra lateral de precio en vivo D1; un simple `setTimeout` + limpieza es
 * suficiente aquí porque la meta es limitar una llamada de red según un
 * presupuesto temporal, no ahorrar presión de render, así que se descarta
 * `useDeferredValue`.
 */
export function useDebouncedValue<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
