import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { COVERAGES_BY_TYPE, COVERAGE_NAMES, INSURANCE_TYPES, LOCATION_NAMES } from './seed-data';
import type { LocationCode } from '../src/domain/premium/premium.types';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BCRYPT_COST = 10;

async function seedInsuranceTypesAndCoverages() {
  for (const insuranceType of INSURANCE_TYPES) {
    const created = await prisma.insuranceType.upsert({
      where: { code: insuranceType.code },
      update: { name: insuranceType.name },
      create: insuranceType,
    });

    for (const coverageCode of COVERAGES_BY_TYPE[insuranceType.code]) {
      await prisma.coverage.upsert({
        where: {
          insuranceTypeId_code: {
            insuranceTypeId: created.id,
            code: coverageCode,
          },
        },
        update: { name: COVERAGE_NAMES[coverageCode] },
        create: {
          code: coverageCode,
          name: COVERAGE_NAMES[coverageCode],
          insuranceTypeId: created.id,
        },
      });
    }
  }
}

async function seedLocations() {
  for (const [code, name] of Object.entries(LOCATION_NAMES) as Array<[LocationCode, string]>) {
    await prisma.location.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }
}

async function seedDemoUser() {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@libelulasoft.com';
  const password = process.env.DEMO_USER_PASSWORD ?? 'Demo1234!';
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
}

async function main() {
  await seedInsuranceTypesAndCoverages();
  await seedLocations();
  await seedDemoUser();

  // eslint-disable-next-line no-console
  console.log('Seed complete: insurance types, coverages, locations, demo user.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
