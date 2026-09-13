import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDatabase } from './app.factory';

describe('Catalogs (e2e)', () => {
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

  it('GET /catalogs/insurance-types — 200 with AUTO, SALUD, HOGAR (no auth)', async () => {
    const response = await request(app.getHttpServer()).get('/catalogs/insurance-types');

    expect(response.status).toBe(200);
    const codes = response.body.items.map((item: { code: string }) => item.code);
    expect(codes).toEqual(expect.arrayContaining(['AUTO', 'SALUD', 'HOGAR']));
  });

  it('GET /catalogs/coverages?insuranceType=AUTO — 200 with only coverages valid for AUTO', async () => {
    const response = await request(app.getHttpServer()).get('/catalogs/coverages?insuranceType=AUTO');

    expect(response.status).toBe(200);
    const codes = response.body.items.map((item: { code: string }) => item.code).sort();
    expect(codes).toEqual(['BASICA', 'ESTANDAR', 'PREMIUM']);
  });

  it('GET /catalogs/coverages?insuranceType=HOGAR — 200 without PREMIUM', async () => {
    const response = await request(app.getHttpServer()).get('/catalogs/coverages?insuranceType=HOGAR');

    expect(response.status).toBe(200);
    const codes = response.body.items.map((item: { code: string }) => item.code);
    expect(codes).not.toContain('PREMIUM');
  });

  it('GET /catalogs/coverages — 400 Problem Details when insuranceType is missing', async () => {
    const response = await request(app.getHttpServer()).get('/catalogs/coverages');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.title).toBeDefined();
    expect(response.body.detail).toBeDefined();
  });

  it('GET /catalogs/coverages?insuranceType=UNKNOWN — 400 Problem Details, not 500', async () => {
    const response = await request(app.getHttpServer()).get('/catalogs/coverages?insuranceType=UNKNOWN');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('GET /catalogs/locations — 200 with bounded EC- prefixed codes including EC-AZUAY', async () => {
    const response = await request(app.getHttpServer()).get('/catalogs/locations');

    expect(response.status).toBe(200);
    const codes = response.body.items.map((item: { code: string }) => item.code);
    expect(codes).toContain('EC-AZUAY');
    for (const code of codes) {
      expect(code).toMatch(/^EC-/);
    }
  });
});
