import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuoteModule } from '../quote/quote.module';
import { GetPolicyUseCase } from './application/get-policy.use-case';
import { IssuePolicyUseCase } from './application/issue-policy.use-case';
import { PolicyRepository } from './infrastructure/policy.repository';
import { PolicyController } from './policy.controller';

@Module({
  // PolicyModule importa QuoteModule solo para recibir el token exportado
  // QUOTE_LOOKUP (diseño D2); nunca importa QuoteRepository ni ningún DTO o
  // entidad de Quote directamente.
  imports: [QuoteModule, AuthModule],
  controllers: [PolicyController],
  providers: [IssuePolicyUseCase, GetPolicyUseCase, PolicyRepository],
})
export class PolicyModule {}
