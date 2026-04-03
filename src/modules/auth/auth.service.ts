import { randomUUID } from 'node:crypto';

import { and, eq, gt } from 'drizzle-orm';

import type { Env } from '../../config/env.js';
import { getDb } from '../../config/database.js';
import { refreshTokens, users } from '../../db/schema/index.js';
import { UnauthorizedError } from '../../lib/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { verifyPassword } from '../../lib/password.js';

import type { AuthTokensResponse, LoginBody, RefreshBody } from './auth.schema.js';

export function createAuthService(env: Env) {
  const db = getDb(env);

  async function login(body: LoginBody): Promise<AuthTokensResponse> {
    const email = body.email.toLowerCase();
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user === undefined || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL * 1000);

    await db.insert(refreshTokens).values({
      id: jti,
      userId: user.id,
      expiresAt,
    });

    const accessToken = await signAccessToken(env, {
      tenantId: user.tenantId,
      sub: user.id,
      role: user.role,
    });
    const refreshToken = await signRefreshToken(env, {
      tenantId: user.tenantId,
      sub: user.id,
      role: user.role,
      jti,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_TTL,
      tokenType: 'Bearer',
    };
  }

  async function refresh(body: RefreshBody): Promise<AuthTokensResponse> {
    let payload: Awaited<ReturnType<typeof verifyRefreshToken>>;
    try {
      payload = await verifyRefreshToken(env, body.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokens = await db.transaction(async (tx) => {
      const row = await tx.query.refreshTokens.findFirst({
        where: and(
          eq(refreshTokens.id, payload.jti),
          eq(refreshTokens.userId, payload.sub),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      });

      if (row === undefined) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const user = await tx.query.users.findFirst({
        where: eq(users.id, payload.sub),
      });

      if (!user) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      if (user.tenantId !== payload.tenantId || user.role !== payload.role) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      await tx.delete(refreshTokens).where(eq(refreshTokens.id, payload.jti));

      const newJti = randomUUID();
      const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL * 1000);
      await tx.insert(refreshTokens).values({
        id: newJti,
        userId: user.id,
        expiresAt,
      });

      const accessToken = await signAccessToken(env, {
        tenantId: user.tenantId,
        sub: user.id,
        role: user.role,
      });
      const refreshToken = await signRefreshToken(env, {
        tenantId: user.tenantId,
        sub: user.id,
        role: user.role,
        jti: newJti,
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: env.JWT_ACCESS_TTL,
        tokenType: 'Bearer' as const,
      };
    });

    return tokens;
  }

  return { login, refresh };
}
