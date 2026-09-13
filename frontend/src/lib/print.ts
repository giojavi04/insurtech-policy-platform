/** Nombrado para que el disparador sea verificable en tests sin simular un diálogo de impresión real. */
export function printPolicy(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
