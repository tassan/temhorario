import { createHash } from 'node:crypto';

export const API_KEY_PREFIX = 'ae_live_' as const;

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey, 'utf8').digest('hex');
}

export function isApiKeyFormat(rawKey: string): boolean {
  return rawKey.startsWith(API_KEY_PREFIX) && rawKey.length > API_KEY_PREFIX.length;
}
