import type { INestApplication } from '@nestjs/common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { ErrorCode } from '../src/common/problem-details/error-code.enum';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { ProblemDetailsFilter } from '../src/common/problem-details/problem-details.filter';
import { flattenValidationErrors } from '../src/validation-error.util';

export const DEMO_USER = {
  email: 'demo@libelulasoft.com',
  password: 'Demo1234!',
};

/** Arranca una aplicación Nest real (Postgres real, sin mocks) para Supertest. */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: ErrorCode.VALIDATION_FAILED,
          detail: 'One or more fields failed validation.',
          errors: flattenValidationErrors(errors),
        }),
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());

  await app.init();
  return app;
}

/** Vacía todas las tablas y luego llena los fixtures exactos que usan las pruebas de integración. */
export async function resetDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.truncateAll();

  const auto = await prisma.insuranceType.create({
    data: { code: 'AUTO', name: 'Seguro de Auto' },
  });
  const salud = await prisma.insuranceType.create({
    data: { code: 'SALUD', name: 'Seguro de Salud' },
  });
  const hogar = await prisma.insuranceType.create({
    data: { code: 'HOGAR', name: 'Seguro de Hogar' },
  });

  await prisma.coverage.createMany({
    data: [
      { code: 'BASICA', name: 'Cobertura Básica', insuranceTypeId: auto.id },
      { code: 'ESTANDAR', name: 'Cobertura Estándar', insuranceTypeId: auto.id },
      { code: 'PREMIUM', name: 'Cobertura Premium', insuranceTypeId: auto.id },
      { code: 'BASICA', name: 'Cobertura Básica', insuranceTypeId: salud.id },
      { code: 'ESTANDAR', name: 'Cobertura Estándar', insuranceTypeId: salud.id },
      { code: 'PREMIUM', name: 'Cobertura Premium', insuranceTypeId: salud.id },
      // HOGAR no tiene PREMIUM de forma intencionada — el fixture
      // para el caso de desajuste de catálogo 400.
      { code: 'BASICA', name: 'Cobertura Básica', insuranceTypeId: hogar.id },
      { code: 'ESTANDAR', name: 'Cobertura Estándar', insuranceTypeId: hogar.id },
    ],
  });

  await prisma.location.createMany({
    data: [
      { code: 'EC-AZUAY', name: 'Azuay' },
      { code: 'EC-PICHINCHA', name: 'Pichincha' },
      { code: 'EC-GUAYAS', name: 'Guayas' },
      { code: 'EC-MANABI', name: 'Manabí' },
      { code: 'EC-LOJA', name: 'Loja' },
    ],
  });

  await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      passwordHash: await bcrypt.hash(DEMO_USER.password, 10),
    },
  });
}
