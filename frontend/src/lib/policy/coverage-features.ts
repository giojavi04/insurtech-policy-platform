/**
 * Copia estática y decorativa de cobertura por tipo de seguro — información
 * ilustrativa del producto que acompaña los recuadros del mockup tipo
 * "coverage callout", y deliberadamente NO se presenta como dato de backend:
 * el contrato fijo `PolicyResponse` no lleva detalles de cobertura
 * (`{ id, quoteId, status, issuedAt }` únicamente), así que cada consumidor
 * de este módulo debe renderizarlo como información general del plan y nunca
 * como un campo por póliza que devuelva la API.
 */
export interface CoverageFeature {
  title: string;
  description: string;
}

export const COVERAGE_FEATURES: Record<string, CoverageFeature[]> = {
  AUTO: [
    {
      title: 'Robo Total y Parcial',
      description: 'Reposición del vehículo asegurado ante robo total o parcial, según el valor comercial pactado.',
    },
    {
      title: 'Daños a Terceros (R.C.)',
      description: 'Amparo legal y cobertura patrimonial por daños ocasionados a terceros.',
    },
    {
      title: 'Asistencia Vial 24/7',
      description: 'Grúa, auxilio mecánico y cerrajería en ruta, disponible todos los días.',
    },
  ],
  SALUD: [
    {
      title: 'Consultas y Emergencias',
      description: 'Atención médica ambulatoria y de urgencias en la red de clínicas afiliadas.',
    },
    {
      title: 'Hospitalización',
      description: 'Cobertura de gastos por hospitalización y procedimientos quirúrgicos.',
    },
    {
      title: 'Medicamentos Recetados',
      description: 'Reembolso parcial de medicamentos bajo prescripción médica.',
    },
  ],
  HOGAR: [
    {
      title: 'Incendio y Desastres Naturales',
      description: 'Protección estructural ante incendio, sismo e inundación.',
    },
    {
      title: 'Robo de Contenidos',
      description: 'Cobertura de bienes muebles ante robo con violencia.',
    },
    {
      title: 'Responsabilidad Civil Familiar',
      description: 'Amparo legal por daños involuntarios a terceros dentro del hogar asegurado.',
    },
  ],
};

/** Devuelve `[]` para un tipo de seguro desconocido o ausente — los llamadores deben renderizar nada y nunca una conjetura. */
export function coverageFeaturesFor(insuranceType: string | undefined): CoverageFeature[] {
  if (!insuranceType) return [];
  return COVERAGE_FEATURES[insuranceType] ?? [];
}
