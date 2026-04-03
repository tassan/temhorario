import type { Env } from '../config/env.js';

const LEVELS = { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 } as const;

function levelIndex(level: keyof typeof LEVELS): number {
  return LEVELS[level];
}

function shouldLog(env: Env, level: keyof typeof LEVELS): boolean {
  return levelIndex(level) <= levelIndex(env.LOG_LEVEL);
}

export function createLogger(env: Env) {
  const base = (level: keyof typeof LEVELS, msg: string, data?: Record<string, unknown>) => {
    if (!shouldLog(env, level)) return;
    const line = {
      level,
      msg,
      ...(data !== undefined ? { data } : {}),
    };
    if (level === 'error' || level === 'fatal') {
      console.error(JSON.stringify(line));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(line));
    } else {
      console.info(JSON.stringify(line));
    }
  };

  return {
    error: (msg: string, data?: Record<string, unknown>) => {
      base('error', msg, data);
    },
    warn: (msg: string, data?: Record<string, unknown>) => {
      base('warn', msg, data);
    },
    info: (msg: string, data?: Record<string, unknown>) => {
      base('info', msg, data);
    },
    debug: (msg: string, data?: Record<string, unknown>) => {
      base('debug', msg, data);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
