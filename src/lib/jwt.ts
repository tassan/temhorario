import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

import type { Env } from '../config/env.js';

const accessPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  sub: z.string().uuid(),
  role: z.enum(['owner', 'staff']),
});

export type AccessTokenPayload = z.infer<typeof accessPayloadSchema>;

function getSecretKey(env: Env): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signAccessToken(env: Env, payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ tenantId: payload.tenantId, role: payload.role })
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
  return accessPayloadSchema.parse({ tenantId, sub, role });
}
