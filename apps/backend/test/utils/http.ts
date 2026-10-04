import request from 'supertest';

const DEFAULT_HEADERS = { 'User-Agent': 'vitest-e2e' };

export function get(server: unknown, path: string) {
  return request(server).get(path).set(DEFAULT_HEADERS);
}

export function post(server: unknown, path: string) {
  return request(server).post(path).set(DEFAULT_HEADERS);
}

export function patch(server: unknown, path: string) {
  return request(server).patch(path).set(DEFAULT_HEADERS);
}
