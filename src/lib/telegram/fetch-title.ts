/**
 * Fetch a URL and extract the <title> for use as bookmark description.
 * Used by the Telegram webhook. Timeout 4s; returns null on failure.
 */

const TITLE_MAX_LENGTH = 255;
const FETCH_TIMEOUT_MS = 4000;

export async function fetchPageTitle(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Pinbook/1.0; +https://pinbook.xyz)'
      },
      redirect: 'follow'
    });
    clearTimeout(timeoutId);
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) return null;
    const html = await res.text();
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!match) return null;
    const title = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    if (!title) return null;
    return title.length > TITLE_MAX_LENGTH ? title.slice(0, TITLE_MAX_LENGTH) : title;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
