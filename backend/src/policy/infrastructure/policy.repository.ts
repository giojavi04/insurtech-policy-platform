import { Injectable } from '@nestjs/common';
import type { Policy } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Se apoya en `Policy.quoteId @unique` (decisión de diseño D3) para evitar
   * emisiones dobles de forma segura frente a carreras: una llamada duplicada
   * concurrente pierde ante Postgres y lanza el error Prisma P2002, que el
   * filtro global convierte en 409.
   */
  create(quoteId: string): Promise<Policy> {
    return this.prisma.policy.create({ data: { quoteId } });
  }

  findById(id: string): Promise<Policy | null> {
    return this.prisma.policy.findUnique({ where: { id } });
  }
}
