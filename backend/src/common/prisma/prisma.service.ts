import 'dotenv/config';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Borra cada fila de cada tabla, en orden seguro para claves foráneas.
   * Ayudante solo de pruebas, usado por el runner de Supertest para
   * reiniciar el estado entre casos.
   */
  async truncateAll(): Promise<void> {
    await this.policy.deleteMany();
    await this.quote.deleteMany();
    await this.coverage.deleteMany();
    await this.location.deleteMany();
    await this.insuranceType.deleteMany();
    await this.user.deleteMany();
    this.logger.debug('Truncated all tables for test isolation');
  }
}
