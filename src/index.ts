import './config/load-env-files.js';

import { serve } from '@hono/node-server';

import { createApp } from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    const port = String(info.port);
    console.info(`Listening on http://localhost:${port} (${env.NODE_ENV})`);
  },
);
