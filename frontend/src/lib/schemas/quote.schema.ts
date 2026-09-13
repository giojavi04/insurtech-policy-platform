import { z } from 'zod';

// Refleja backend/src/quote/dto/create-quote.dto.ts. La validación del cliente
// existe para evitar viajes innecesarios; el backend sigue siendo la fuente de
// verdad y vuelve a validar (incluida pertenencia al catálogo) en cada petición.
export const INSURANCE_TYPE_CODES = ['AUTO', 'SALUD', 'HOGAR'] as const;

export const quoteFormSchema = z.object({
  insuranceType: z.enum(INSURANCE_TYPE_CODES, {
    errorMap: () => ({ message: 'Selecciona un tipo de seguro.' }),
  }),
  coverage: z.string().min(1, 'Selecciona una cobertura.'),
  age: z.coerce
    .number({ invalid_type_error: 'La edad es obligatoria.' })
    .int('La edad debe ser un número entero.')
    .min(18, 'La edad mínima es 18.')
    .max(99, 'La edad máxima es .'),
  location: z.string().min(1, 'Selecciona una ubicación.'),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
