/**
 * Server-side store for Telegram ↔ Pinboard linking.
 * Uses Upstash Redis when KV_REST_URL and KV_REST_TOKEN are set;
 * falls back to in-memory store for local dev (not persisted across restarts).
 */

import { createHash } from 'crypto';

const CODE_TTL_SECONDS = 600; // 10 minutes
const CODE_PREFIX = 'telegram:code:';
const USER_PREFIX = 'telegram:user:';
const TOKEN_HASH_PREFIX = 'telegram:token:';

function hashToken(apiToken: string): string {
  return createHash('sha256').update(apiToken, 'utf8').digest('hex');
}

// In-memory fallback when Redis is not configured
const memoryCodes = new Map<string, { apiToken: string; expiresAt: number }>();
const memoryUsers = new Map<string, string>();
const memoryTokenToTelegram = new Map<string, string>();

async function getRedis() {
  const url = process.env.KV_REST_URL;
  const token = process.env.KV_REST_TOKEN;
  if (url && token) {
    const { Redis } = await import('@upstash/redis');
    return new Redis({ url, token });
  }
  return null;
}

export async function setCode(code: string, apiToken: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.setex(CODE_PREFIX + code, CODE_TTL_SECONDS, apiToken);
    return;
  }
  memoryCodes.set(code, {
    apiToken,
    expiresAt: Date.now() + CODE_TTL_SECONDS * 1000
  });
}

export async function getCodeAndDelete(code: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis) {
    const key = CODE_PREFIX + code;
    const apiToken = await redis.get<string>(key);
    if (apiToken) {
      await redis.del(key);
      return apiToken;
    }
    return null;
  }
  const entry = memoryCodes.get(code);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCodes.delete(code);
    return null;
  }
  memoryCodes.delete(code);
  return entry.apiToken;
}

export async function linkTelegramUser(telegramId: string, apiToken: string): Promise<void> {
  const redis = await getRedis();
  const hash = hashToken(apiToken);
  if (redis) {
    await redis.set(USER_PREFIX + telegramId, apiToken);
    await redis.set(TOKEN_HASH_PREFIX + hash, telegramId);
    return;
  }
  memoryUsers.set(telegramId, apiToken);
  memoryTokenToTelegram.set(hash, telegramId);
}

export async function getApiTokenByTelegramId(telegramId: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis) {
    return redis.get<string>(USER_PREFIX + telegramId);
  }
  return memoryUsers.get(telegramId) ?? null;
}

export async function getTelegramIdByTokenHash(apiToken: string): Promise<string | null> {
  const redis = await getRedis();
  const hash = hashToken(apiToken);
  if (redis) {
    return redis.get<string>(TOKEN_HASH_PREFIX + hash);
  }
  return memoryTokenToTelegram.get(hash) ?? null;
}

export async function disconnectByApiToken(apiToken: string): Promise<boolean> {
  const telegramId = await getTelegramIdByTokenHash(apiToken);
  if (!telegramId) return false;
  const redis = await getRedis();
  const hash = hashToken(apiToken);
  if (redis) {
    await redis.del(USER_PREFIX + telegramId);
    await redis.del(TOKEN_HASH_PREFIX + hash);
    return true;
  }
  memoryUsers.delete(telegramId);
  memoryTokenToTelegram.delete(hash);
  return true;
}
