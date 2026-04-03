import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

import type { Env } from '../config/env.js';

const accessPayloadSchema = z.object({
  typ: z.literal('access'),
  tenantId: z.string().uuid(),
  sub: z.string().uuid(),
  role: z.enum(['owner', 'staff']),
});

export type AccessTokenPayload = z.infer<typeof accessPayloadSchema>;

const refreshPayloadSchema = z.object({
  typ: z.literal('refresh'),
  tenantId: z.string().uuid(),
  sub: z.string().uuid(),
  role: z.enum(['owner', 'staff']),
  jti: z.string().uuid(),
});

export type RefreshTokenPayload = z.infer<typeof refreshPayloadSchema>;

function getSecretKey(env: Env): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signAccessToken(env: Env, payload: Omit<AccessTokenPayload, 'typ'>): Promise<string> {
  return new SignJWT({ tenantId: payload.tenantId, role: payload.role, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${String(env.JWT_ACCESS_TTL)}s`)
    .sign(getSecretKey(env));
}

export async function verifyAccessToken(env: Env, token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(env), {
    algorithms: ['HS256'],
  });
  const sub = typeof payload.sub === 'string' ? payload.sub : undefined;
  const tenantId = typeof payload.tenantId === 'string' ? payload.tenantId : undefined;
  const role = payload.role;
  const typ = payload.typ;
  return accessPayloadSchema.parse({ tenantId, sub, role, typ });
}

export async function signRefreshToken(
  env: Env,
  payload: Omit<RefreshTokenPayload, 'typ'>,
): Promise<string> {
  return new SignJWT({ tenantId: payload.tenantId, role: payload.role, typ: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt()
    .setExpirationTime(`${String(env.JWT_REFRESH_TTL)}s`)
    .sign(getSecretKey(env));
}

export async function verifyRefreshToken(env: Env, token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(env), {
    algorithms: ['HS256'],
  });
  const sub = typeof payload.sub === 'string' ? payload.sub : undefined;
  const tenantId = typeof payload.tenantId === 'string' ? payload.tenantId : undefined;
  const role = payload.role;
  const typ = payload.typ;
  const jti = typeof payload.jti === 'string' ? payload.jti : undefined;
  return refreshPayloadSchema.parse({ tenantId, sub, role, typ, jti });
}
