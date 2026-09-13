import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, DEMO_USER, resetDatabase } from './app.factory';

describe('Auth (e2e)', () => {
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

  it('POST /auth/login — 200 with a verifiable JWT for the seeded demo user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: DEMO_USER.email, password: DEMO_USER.password });

    expect(response.status).toBe(200);
    expect(response.body.tokenType).toBe('Bearer');
    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.accessToken.split('.')).toHaveLength(3);
  });

  it('POST /auth/login — 401 Problem Details for a wrong password, no token issued', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: DEMO_USER.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
    expect(response.body.accessToken).toBeUndefined();
  });

  it('POST /auth/login — 401 Problem Details for an unknown email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });
});
