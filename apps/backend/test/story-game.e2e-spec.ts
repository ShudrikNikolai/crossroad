import { createTestApp, API_PREFIX } from './utils/create-test-app';
import { get, post, patch } from './utils/http';
import { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Story publish → game playthrough (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();

    const register = await post(server, `${API_PREFIX}/auth/register`).send({
      email: `e2e-story-${Date.now()}@example.com`,
      username: `story_${Date.now()}`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    accessToken = register.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await app.close();
  });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  let storyId: string;

  it('creates a story', async () => {
    const res = await post(server, `${API_PREFIX}/stories`)
      .set(auth())
      .send({ title: 'E2E story' });
    console.log('CREATE STORY BODY >>>', JSON.stringify(res.body, null, 2));
    expect(res.status).toBe(201);
    storyId = res.body.data.id;
  });

  it('adds start and end nodes, connects them, and sets the start node', async () => {
    console.log('storyId >>>>>>>', {
      storyId,
      path: `${API_PREFIX}/stories/${storyId}/nodes`,
    });
    await post(server, `${API_PREFIX}/stories/${storyId}/nodes`)
      .set(auth())
      .send({
        storyId,
        id: 'start',
        type: 'scene',
        position: { x: 0, y: 0 },
        content: { text: 'Начало' },
      })
      .then((res) =>
        console.log('NODE CREATE >>>', JSON.stringify(res.body, null, 2)),
      );

    await post(server, `${API_PREFIX}/stories/${storyId}/nodes`)
      .set(auth())
      .send({
        storyId,
        id: 'end',
        type: 'end',
        position: { x: 100, y: 0 },
        content: { text: 'Конец' },
      })
      .expect(201);

    await post(server, `${API_PREFIX}/stories/${storyId}/edges`)
      .set(auth())
      .send({
        storyId,
        id: 'edge-1',
        source: 'start',
        target: 'end',
        label: 'Идти дальше',
      })
      .expect(201);

    await patch(server, `${API_PREFIX}/stories/${storyId}`)
      .set(auth())
      .send({ storyId, startNodeId: 'start' })
      .expect(200);
  });

  it('publishes the story', async () => {
    const res = await post(
      server,
      `${API_PREFIX}/stories/${storyId}/publish`,
    ).set(auth());
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('published');
  });

  let playthroughId: string;

  it('starts a playthrough at the start node with the available choice', async () => {
    const res = await post(server, `${API_PREFIX}/games`)
      .set(auth())
      .send({ storyId, name: 'test-game' });
    console.log('res#1 CREATE >>>', JSON.stringify(res.body, null, 2));
    expect(res.status).toBe(201);
    playthroughId = res.body.data.playthroughId;
    expect(res.body.data.node.id).toBe('start');
    expect(res.body.data.choices).toEqual([
      { storyId, edgeId: 'edge-1', label: 'Идти дальше' },
    ]);
  });

  it('advances through the chosen edge and completes the playthrough', async () => {
    const res = await post(
      server,
      `${API_PREFIX}/games/${playthroughId}/next-step`,
    )
      .set(auth())
      .send({ edgeId: 'edge-1' });
    console.log('res#2 CREATE >>>', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.node.id).toBe('end');
  });

  it('rejects a step on an already-completed playthrough', async () => {
    const res = await post(
      server,
      `${API_PREFIX}/games/${playthroughId}/next-step`,
    )
      .set(auth())
      .send({ edgeId: 'edge-1' });
    console.log('res#3 CREATE >>>', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(409);
  });
});
