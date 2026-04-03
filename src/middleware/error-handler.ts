import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { AppError } from '../lib/errors.js';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(err.toJSON(), err.status as ContentfulStatusCode);
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR' as const,
        message,
      },
    },
    500,
  );
};
