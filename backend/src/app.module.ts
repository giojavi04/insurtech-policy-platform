import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { PolicyModule } from './policy/policy.module';
import { QuoteModule } from './quote/quote.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CatalogModule,
    QuoteModule,
    AuthModule,
    PolicyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
