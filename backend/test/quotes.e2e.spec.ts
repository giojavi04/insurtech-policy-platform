import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDatabase } from './app.factory';

describe('Quotes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /quotes — 201 reproduces the documented worked example exactly', async () => {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .send({ insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: 'QUOTED',
      inputs: { insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' },
      estimatedPremium: '350.00',
      breakdown: [
        { concept: 'BASE', amount: '200.00' },
        { concept: 'AGE_FACTOR', amount: '60.00' },
        { concept: 'LOCATION_FACTOR', amount: '40.00' },
        { concept: 'COVERAGE_FACTOR', amount: '50.00' },
      ],
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('POST /quotes — 400 Problem Details on missing required field, no quote persisted', async () => {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .send({ coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('POST /quotes — 400 Problem Details on age outside allowed range', async () => {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .send({ insuranceType: 'AUTO', coverage: 'BASICA', age: 5, location: 'EC-AZUAY' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('POST /quotes — 400 CATALOG_VALUE_INVALID when coverage is not valid for insuranceType (HOGAR+PREMIUM)', async () => {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .send({ insuranceType: 'HOGAR', coverage: 'PREMIUM', age: 30, location: 'EC-AZUAY' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('CATALOG_VALUE_INVALID');
  });

  it('POST /quotes — 400 CATALOG_VALUE_INVALID when location is not seeded', async () => {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .send({ insuranceType: 'AUTO', coverage: 'BASICA', age: 30, location: 'EC-NOWHERE' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('CATALOG_VALUE_INVALID');
  });

  it('GET /quotes/{id} — 200 with the same shape as POST for an existing quote', async () => {
    const created = await request(app.getHttpServer())
      .post('/quotes')
      .send({ insuranceType: 'SALUD', coverage: 'ESTANDAR', age: 40, location: 'EC-GUAYAS' });

    const response = await request(app.getHttpServer()).get(`/quotes/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(created.body);
  });

  it('GET /quotes/{id} — 404 Problem Details for a non-existent id', async () => {
    const response = await request(app.getHttpServer()).get(
      '/quotes/00000000-0000-4000-8000-000000000000',
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('QUOTE_NOT_FOUND');
  });
});
