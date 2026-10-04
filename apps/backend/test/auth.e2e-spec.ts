import { createTestApp, API_PREFIX } from './utils/create-test-app';
import { get, post } from './utils/http';
import { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Auth flow (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;

  const email = `e2e-${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `e2e_${Date.now()}`;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await app.close();
  });

  it('registers a new user: access token in body, refresh only in httpOnly cookie', async () => {
    const res = await post(server, `${API_PREFIX}/auth/register`).send({
      email,
      username,
      password,
      confirmPassword: password,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.refreshToken).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/refresh-token=.+HttpOnly/i);
  });

  it('rejects a second registration with the same email', async () => {
    const res = await post(server, `${API_PREFIX}/auth/register`).send({
      email,
      username: `${username}_2`,
      password,
      confirmPassword: password,
    });

    expect(res.status).toBe(409);
  });

  let accessToken: string;
  let refreshCookie: string;

  it('logs in with correct credentials', async () => {
    const res = await post(server, `${API_PREFIX}/auth/login`).send({
      email,
      password,
    });

    expect(res.status).toBe(201);
    accessToken = res.body.data.accessToken;
    refreshCookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('rejects login with a wrong password', async () => {
    const res = await post(server, `${API_PREFIX}/auth/login`).send({
      email,
      password: 'WrongPass123!',
    });

    expect(res.status).toBe(401);
  });

  it('accesses a protected route with the access token', async () => {
    const res = await get(server, `${API_PREFIX}/profile/me`).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe(username);
  });

  it('rejects the protected route without a token', async () => {
    const res = await get(server, `${API_PREFIX}/profile/me`);
    expect(res.status).toBe(401);
  });

  it('rejects reusing the old, already-rotated refresh cookie', async () => {
    const res = await post(server, `${API_PREFIX}/auth/refresh`).set(
      'Cookie',
      refreshCookie,
    );
    expect(res.status).toBe(401);
  });
});
