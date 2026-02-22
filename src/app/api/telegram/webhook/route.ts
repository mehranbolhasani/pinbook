import { NextRequest, NextResponse } from 'next/server';
import type { TelegramUpdate } from '@/lib/telegram/types';
import { sendTelegramMessage } from '@/lib/telegram/bot';
import {
  getCodeAndDelete,
  linkTelegramUser,
  getApiTokenByTelegramId,
  getPendingBookmark,
  setPendingBookmark,
  clearPendingBookmark,
  hasPersistentStore
} from '@/lib/telegram/store';
import { addBookmarkServer } from '@/lib/telegram/pinboard-server';
import { fetchPageTitle } from '@/lib/telegram/fetch-title';

const URL_REGEX = /https?:\/\/[^\s]+/i;

function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  if (!match) return null;
  let url = match[0];
  url = url.replace(/[.,;:!?)]+$/, '');
  return url;
}

/** Parse tags from user message: comma or space separated, trimmed, single space between */
function parseTagsInput(text: string): string {
  return text
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' ');
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (headerSecret !== secret) {
      console.error('Telegram webhook: secret token mismatch (check TELEGRAM_WEBHOOK_SECRET vs setWebhook secret_token)');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('Telegram webhook: TELEGRAM_BOT_TOKEN is not set');
    return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = update.message;
  if (!message?.from?.id || !message.chat?.id) {
    return NextResponse.json({ ok: true });
  }

  // Log so you can confirm in server logs that the webhook is being hit
  const textPreview = (message.text ?? '').slice(0, 50);
  console.log('Telegram webhook: update_id=', update.update_id, 'chat_id=', message.chat.id, 'text=', textPreview || '(no text)');

  const chatId = message.chat.id;
  const telegramId = String(message.from.id);
  const text = (message.text ?? '').trim();

  try {
    // /start <code> — link account
    if (text.startsWith('/start ')) {
      const code = text.slice(7).trim();
      const apiToken = await getCodeAndDelete(code);
      if (!apiToken) {
        await sendTelegramMessage(
          botToken,
          chatId,
          'This code is invalid or expired. Get a new code from Pinbook Settings → Connect Telegram.'
        );
        return NextResponse.json({ ok: true });
      }
      await linkTelegramUser(telegramId, apiToken);
      await sendTelegramMessage(
        botToken,
        chatId,
        '✅ <b>Linked!</b> Send me a URL and I\'ll fetch the title, ask for tags, then save it to Pinboard. Or send /skip when asked for tags to save without tags.'
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/start') {
      await sendTelegramMessage(
        botToken,
        chatId,
        'To connect this chat to Pinboard, get a code from Pinbook Settings → Connect Telegram, then send: <code>/start YOUR_CODE</code>'
      );
      return NextResponse.json({ ok: true });
    }

    const apiToken = await getApiTokenByTelegramId(telegramId);
    if (!apiToken) {
      await sendTelegramMessage(
        botToken,
        chatId,
        'This chat is not linked to Pinboard. Get a code from Pinbook Settings → Connect Telegram and send <code>/start YOUR_CODE</code>'
      );
      return NextResponse.json({ ok: true });
    }

    const urlInMessage = extractFirstUrl(text);
    const pending = await getPendingBookmark(chatId);

    // If user sends a new URL while we were waiting for tags, start over with the new URL
    if (pending && urlInMessage) {
      const title = await fetchPageTitle(urlInMessage);
      const description = title ?? urlInMessage;
      await setPendingBookmark(chatId, { url: urlInMessage, description });
      const titleLine = title ? `\n<b>Title:</b> ${title.slice(0, 100)}${title.length > 100 ? '…' : ''}` : '';
      await sendTelegramMessage(
        botToken,
        chatId,
        `📎 New link received.${titleLine}\n\nSend tags (comma or space separated), or /skip to save without tags.`
      );
      return NextResponse.json({ ok: true });
    }

    // Pending bookmark: this message is tags or /skip
    if (pending) {
      const tags = text === '/skip' ? '' : parseTagsInput(text);
      const result = await addBookmarkServer(apiToken, {
        url: pending.url,
        description: pending.description.slice(0, 255),
        tags: tags || undefined
      });
      await clearPendingBookmark(chatId);
      if (result.ok) {
        const tagPart = tags ? ` with tags: ${tags}` : '';
        await sendTelegramMessage(
          botToken,
          chatId,
          `✅ Saved to Pinboard${tagPart}: ${pending.url}`
        );
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `❌ Failed to save: ${result.error ?? 'Unknown error'}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // New URL: fetch title, then either ask for tags (if Redis) or save immediately (no Redis)
    if (!urlInMessage) {
      await sendTelegramMessage(
        botToken,
        chatId,
        'Send me a link (URL) to save it to Pinboard. Example: https://example.com/article'
      );
      return NextResponse.json({ ok: true });
    }

    const title = await fetchPageTitle(urlInMessage);
    const description = title ?? urlInMessage;

    const canAskForTags = await hasPersistentStore();
    if (!canAskForTags) {
      // No Redis: pending state wouldn't persist across serverless invocations, so save immediately
      const result = await addBookmarkServer(apiToken, {
        url: urlInMessage,
        description: description.slice(0, 255)
      });
      if (result.ok) {
        await sendTelegramMessage(
          botToken,
          chatId,
          `✅ Saved to Pinboard: ${urlInMessage}\n\n(To add tags, set up Redis — see Pinbook docs.)`
        );
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `❌ Failed to save: ${result.error ?? 'Unknown error'}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    await setPendingBookmark(chatId, { url: urlInMessage, description });
    const titleLine = title ? `\n<b>Title:</b> ${title.slice(0, 100)}${title.length > 100 ? '…' : ''}` : '';
    await sendTelegramMessage(
      botToken,
      chatId,
      `📎 Link received.${titleLine}\n\nSend tags (comma or space separated), or /skip to save without tags.`
    );
  } catch (err) {
    console.error('Telegram webhook error:', err);
    await sendTelegramMessage(
      botToken,
      chatId,
      'Something went wrong. Please try again later.'
    );
  }

  return NextResponse.json({ ok: true });
}
