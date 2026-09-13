/**
 * Clases compartidas para los controles de formulario de QuoteForm y
 * LoginDialog. Se mantienen como constantes y no como @apply para que las
 * utilidades sigan siendo fáciles de localizar y los dos formularios no
 * se desalineen.
 */

/** Leyenda en mayúsculas y con espaciado amplio encima de cada campo. */
export const fieldLabelClass = 'text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft';

/**
 * Objetivo táctil mínimo de 44 px, superficie lavanda con tinte y un anillo
 * de enfoque de marca muy visible. El tratamiento deshabilitado es deliberado:
 * la selección de cobertura no disponible es señal primaria de UX, no un
 * detalle cosmético.
 */
export const fieldControlClass = [
  'min-h-[44px] w-full rounded-control border border-transparent bg-lav px-3 py-2.5',
  'font-sans text-base text-ink',
  'transition-[border-color,box-shadow] duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper-raised',
  'aria-[invalid=true]:border-danger',
  'disabled:cursor-not-allowed disabled:text-ink-soft disabled:opacity-60',
].join(' ');

/** El mismo control, pero con el padding izquierdo liberado para un icono
 * dentro de un contenedor `relative`. */
export const fieldControlWithIconClass = `${fieldControlClass} pl-10`;

/** Ritmo vertical para un conjunto de etiqueta, control y error. */
export const fieldGroupClass = 'flex flex-col gap-1.5';
