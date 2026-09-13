import type { PremiumBreakdownItem } from '@/lib/api/types';
import { PREMIUM_CONCEPT_LABELS, labelFor } from '@/lib/labels';

interface PremiumBreakdownProps {
  breakdown: PremiumBreakdownItem[];
  estimatedPremium: string;
}

/**
 * Presentación pura: props de entrada, tabla de salida. Filas limpias con
 * montos tabulares en mono — un estilo seguro-fintech, no el aspecto viejo
 * de recibo detallado (sin guías punteadas ni doble regla gruesa debajo del
 * total).
 */
export function PremiumBreakdown({ breakdown, estimatedPremium }: PremiumBreakdownProps) {
  return (
    <div className="rounded-card bg-paper-raised p-6 shadow-soft sm:p-7">
      <table className="w-full text-left text-sm">
        <caption className="mb-4 text-left font-display text-lg font-semibold text-ink">
          Desglose de la prima
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="border-b border-line pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
            >
              Concepto
            </th>
            <th
              scope="col"
              className="border-b border-line pb-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
            >
              Monto
            </th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item) => (
            <tr key={item.concept} className="border-b border-line last:border-b-0">
              <td className="py-3 text-ink-soft">{labelFor(PREMIUM_CONCEPT_LABELS, item.concept)}</td>
              <td className="whitespace-nowrap py-3 pl-4 text-right font-mono font-medium text-ink nums-tabular">
                {item.amount}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-5 align-baseline text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Prima estimada
            </td>
            <td className="pl-4 pt-5 text-right align-baseline">
              <span className="font-display text-3xl font-bold leading-none text-brand-deep nums-tabular sm:text-4xl">
                {estimatedPremium}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
