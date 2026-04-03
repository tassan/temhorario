import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

import { createLogger } from '../lib/logger.js';
import { AppError } from '../lib/errors.js';
import type { Env } from '../config/env.js';

export function createErrorHandler(env: Env): ErrorHandler {
  const log = createLogger(env);

  return (err, c) => {
    const requestId: string = (c.get('requestId') as string | undefined) ?? 'unknown';

    if (err instanceof AppError) {
      if (err.status >= 500) {
        log.error('app_error', {
          requestId,
          code: err.code,
          status: err.status,
          message: err.message,
        });
      }
      return c.json(err.toJSON(), err.status as ContentfulStatusCode);
    }

    if (err instanceof ZodError) {
      log.warn('validation_error', { requestId, issues: err.issues.length });
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR' as const,
            message: 'Validation failed',
            details: { issues: err.issues },
          },
        },
        400,
      );
    }

    const message = err instanceof Error ? err.message : 'Internal server error';
    log.error('unhandled_error', {
      requestId,
      message,
      name: err instanceof Error ? err.name : 'unknown',
    });
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR' as const,
          message: env.NODE_ENV === 'production' ? 'Internal server error' : message,
        },
      },
      500,
    );
  };
}
