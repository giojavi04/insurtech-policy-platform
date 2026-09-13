import { Injectable } from '@nestjs/common';
import type { User } from '../generated/prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
