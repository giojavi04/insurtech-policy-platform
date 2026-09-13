// Propiedad de PolicyModule (puerto del consumidor, decisión de diseño D2).
// PolicyModule depende solo de esta interfaz; nunca del repositorio,
// DTOs o modelo Prisma de QuoteModule. Si se migra a una división real entre
// servicios, se puede enlazar un adaptador distinto (por ejemplo HTTP o
// broker) a este mismo token; IssuePolicyUseCase sigue intacto.

export const QUOTE_LOOKUP = Symbol('QUOTE_LOOKUP');

export interface QuoteSnapshot {
  id: string;
  status: 'QUOTED';
  estimatedPremium: string;
}

export interface QuoteLookupPort {
  /** Devuelve `null` si no existe; nunca lanza. Solo instantánea, sin internals de rating. */
  findById(quoteId: string): Promise<QuoteSnapshot | null>;
}
