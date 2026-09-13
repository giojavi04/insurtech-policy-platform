import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

/** Una sola familia geométrica-humanista para display y cuerpo: los títulos y
 * el texto del cuerpo en los mockups comparten un mismo esqueleto (la `a`
 * de doble historia, altura alta) en distintos pesos, y no se trata de una
 * combinación. */
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display-family',
});

/** La misma familia, el mismo patrón de variables CSS que antes — sin ruido
 * en las utilidades `font-sans` del código.
 * Se nombran las variables `--font-*-family` (no `--font-display`/
 * `--font-mono`) para que la salida de next/font no choque con el propio
 * espacio de nombres de tema `--font-*` de Tailwind v4 — `@theme` en
 * globals.css compone las utilidades reales `--font-display`/
 * `--font-sans`/`--font-mono` a partir de estas. */
const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body-family',
});

/** Voz técnica de detalle: UUIDs, fragmentos JWT, digest SHA-256. Altura
 * generosa en x y diferenciación clara entre 0/O y 1/l. */
const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-mono-family',
});

export const metadata: Metadata = {
  title: 'Cotización y Emisión de Pólizas',
  description: 'Cotiza y emite una póliza de seguro de principio a fin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
