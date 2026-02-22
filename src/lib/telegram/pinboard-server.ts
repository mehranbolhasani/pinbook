/**
 * Server-side only: add a bookmark to Pinboard. Used by the Telegram webhook.
 */

import type { AddBookmarkParams } from '@/types/pinboard';

const PINBOARD_API_BASE = 'https://api.pinboard.in/v1';

export async function addBookmarkServer(
  authToken: string,
  params: AddBookmarkParams
): Promise<{ ok: boolean; error?: string }> {
  const url = new URL(`${PINBOARD_API_BASE}/posts/add`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('auth_token', authToken);
  url.searchParams.set('url', params.url);
  url.searchParams.set('description', params.description ?? params.url);
  if (params.extended) url.searchParams.set('extended', params.extended);
  if (params.tags) url.searchParams.set('tags', params.tags);
  if (params.shared) url.searchParams.set('shared', params.shared);
  if (params.toread) url.searchParams.set('toread', params.toread);

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Pinbook/1.0 Telegram' }
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `${res.status}: ${text}` };
  }
  const data = (await res.json()) as { result_code?: string };
  if (data.result_code !== 'done') {
    return { ok: false, error: data.result_code ?? 'Unknown error' };
  }
  return { ok: true };
}
