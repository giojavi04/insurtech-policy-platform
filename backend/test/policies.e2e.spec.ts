import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, DEMO_USER, resetDatabase } from './app.factory';

describe('Policies (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: DEMO_USER.email, password: DEMO_USER.password });
    token = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  async function createQuote(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .send({ insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' });
    return response.body.id;
  }

  it('POST /policies — 401 Problem Details without an Authorization header', async () => {
    const quoteId = await createQuote();

    const response = await request(app.getHttpServer()).post('/policies').send({ quoteId });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  });

  it('POST /policies — 401 Problem Details with a malformed/invalid Bearer token', async () => {
    const quoteId = await createQuote();

    const response = await request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ quoteId });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  });

  it('POST /policies — 201 issues exactly one policy for a valid quoteId with a valid token', async () => {
    const quoteId = await createQuote();

    const response = await request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({ quoteId });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ quoteId, status: 'ACTIVE' });
    expect(response.body.id).toBeDefined();
    expect(response.body.issuedAt).toBeDefined();
  });

  it('POST /policies — 404 Problem Details for an unknown quoteId', async () => {
    const response = await request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({ quoteId: '00000000-0000-4000-8000-000000000000' });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('QUOTE_NOT_FOUND');
  });

  it('POST /policies — 409 Conflict on a duplicate quoteId, no second policy created', async () => {
    const quoteId = await createQuote();

    const first = await request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({ quoteId });
    expect(first.status).toBe(201);

    const second = await request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({ quoteId });

    expect(second.status).toBe(409);
    expect(second.body.code).toBe('POLICY_ALREADY_ISSUED');
  });

  it('GET /policies/{id} — 200 with the persisted policy for a valid token and existing id', async () => {
    const quoteId = await createQuote();
    const issued = await request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({ quoteId });

    const response = await request(app.getHttpServer())
      .get(`/policies/${issued.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(issued.body);
  });

  it('GET /policies/{id} — 401 Problem Details without a token', async () => {
    const response = await request(app.getHttpServer()).get(
      '/policies/00000000-0000-4000-8000-000000000000',
    );

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  });

  it('GET /policies/{id} — 404 Problem Details for a non-existent id with a valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/policies/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('POLICY_NOT_FOUND');
  });
});
