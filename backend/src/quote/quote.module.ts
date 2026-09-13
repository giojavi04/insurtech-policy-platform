import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { QUOTE_LOOKUP } from '../policy/ports/quote-lookup.port';
import { CreateQuoteUseCase } from './application/create-quote.use-case';
import { GetQuoteUseCase } from './application/get-quote.use-case';
import { InProcessQuoteLookupAdapter } from './infrastructure/in-process-quote-lookup.adapter';
import { QuoteRepository } from './infrastructure/quote.repository';
import { QuoteController } from './quote.controller';

@Module({
  imports: [CatalogModule],
  controllers: [QuoteController],
  providers: [
    CreateQuoteUseCase,
    GetQuoteUseCase,
    QuoteRepository,
    { provide: QUOTE_LOOKUP, useClass: InProcessQuoteLookupAdapter },
  ],
  // PolicyModule importa QuoteModule e inyecta solo el token QUOTE_LOOKUP;
  // nunca QuoteRepository, un DTO ni el modelo Prisma de quote.
  exports: [QUOTE_LOOKUP],
})
export class QuoteModule {}
