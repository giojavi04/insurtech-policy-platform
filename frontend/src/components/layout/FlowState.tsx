import { CheckGlyph } from '@/components/ui/icons';

export type FlowStep = 'cotizar' | 'poliza';

interface FlowStateProps {
  current: FlowStep;
}

const STEPS: { key: FlowStep; label: string }[] = [
  { key: 'cotizar', label: 'Cotizar' },
  { key: 'poliza', label: 'Póliza' },
];

type StepState = 'done' | 'current' | 'todo';

const MARKER: Record<StepState, string> = {
  done: 'border-transparent bg-ok text-white',
  current: 'border-transparent bg-brand text-white',
  todo: 'border border-line bg-paper-raised text-ink-soft',
};

const LABEL: Record<StepState, string> = {
  done: 'text-ok',
  current: 'text-ink font-semibold',
  todo: 'text-ink-soft',
};

function stateOf(step: FlowStep, current: FlowStep): StepState {
  const order: FlowStep[] = ['cotizar', 'poliza'];
  const stepIndex = order.indexOf(step);
  const currentIndex = order.indexOf(current);
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'current';
  return 'todo';
}

/**
 * Indicador comprimido de flujo de dos estados (D3): la barra lateral de
 * precio en vivo reúne los pasos anteriores de "cotizar y revisar" en una
 * sola pantalla, por lo que una pista de dos elementos — Cotizar → Póliza —
 * reemplaza el antiguo Stepper de tres pasos. Con exactamente dos elementos
 * no hace falta un diseño dual responsivo, así que todo se agrupa en una sola
 * ruta de marcado.
 */
export function FlowState({ current }: FlowStateProps) {
  return (
    <ol className="flex items-center gap-2.5">
      {STEPS.map((step, index) => {
        const state = stateOf(step.key, current);
        const isLast = index === STEPS.length - 1;

        return (
          <li
            key={step.key}
            aria-current={state === 'current' ? 'step' : undefined}
            className="flex items-center gap-2.5"
          >
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${MARKER[state]}`}
            >
              {state === 'done' ? <CheckGlyph className="h-3 w-3" /> : index + 1}
            </span>
            <span className={`text-sm ${LABEL[state]}`}>{step.label}</span>
            {!isLast && <span aria-hidden="true" className="mx-1 h-px w-8 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}
