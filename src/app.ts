import { Hono } from 'hono';

import { errorHandler } from './middleware/error-handler.js';

export function createApp(): Hono {
  const app = new Hono();
  app.onError(errorHandler);

  app.get('/health', (c) => c.json({ status: 'ok' }));

  return app;
}
