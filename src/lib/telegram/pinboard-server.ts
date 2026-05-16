/**
 * Server-side only: Pinboard API operations. Used by the Telegram webhook.
 */

import type { AddBookmarkParams, PinboardBookmark } from '@/types/pinboard';

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

export async function getBookmarksServer(
  authToken: string
): Promise<PinboardBookmark[]> {
  const url = new URL(`${PINBOARD_API_BASE}/posts/all`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('auth_token', authToken);

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Pinbook/1.0 Telegram' }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('getBookmarksServer failed:', res.status, text);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function updateBookmarkServer(
  authToken: string,
  params: AddBookmarkParams
): Promise<{ ok: boolean; error?: string }> {
  const url = new URL(`${PINBOARD_API_BASE}/posts/add`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('auth_token', authToken);
  url.searchParams.set('url', params.url);
  url.searchParams.set('description', params.description);
  url.searchParams.set('replace', 'yes');
  if (params.extended !== undefined) url.searchParams.set('extended', params.extended);
  if (params.tags !== undefined) url.searchParams.set('tags', params.tags);
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
