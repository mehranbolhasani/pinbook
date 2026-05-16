import { NextRequest, NextResponse } from 'next/server';
import type { TelegramUpdate } from '@/lib/telegram/types';
import { sendTelegramMessage, editTelegramMessage, answerCallbackQuery } from '@/lib/telegram/bot';
import {
  getCodeAndDelete,
  linkTelegramUser,
  getApiTokenByTelegramId,
  getPendingBookmark,
  setPendingBookmark,
  clearPendingBookmark,
  getEditContext,
  setEditContext,
  hasPersistentStore,
  type EditContext
} from '@/lib/telegram/store';
import { addBookmarkServer, getBookmarksServer, updateBookmarkServer } from '@/lib/telegram/pinboard-server';
import { fetchPageTitle } from '@/lib/telegram/fetch-title';
import {
  buildListKeyboard,
  buildListMessage,
  buildDetailKeyboard,
  buildDetailMessage,
  buildEditFieldKeyboard,
  buildEditBackToDetailKeyboard,
  buildAfterUpdateKeyboard,
  buildEditPromptMessage
} from '@/lib/telegram/inline-keyboards';
import type { AddBookmarkParams } from '@/types/pinboard';

const URL_REGEX = /https?:\/\/[^\s]+/i;
const BOOKMARKS_PER_PAGE = 5;

function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  if (!match) return null;
  let url = match[0];
  url = url.replace(/[.,;:!?)]+$/, '');
  return url;
}

function parseTagsInput(text: string): string {
  return text
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' ');
}

async function rebuildContext(chatId: number, apiToken: string, page?: number, selectedIndex?: number): Promise<EditContext | null> {
  const bookmarks = await getBookmarksServer(apiToken);
  if (bookmarks.length === 0) return null;
  const totalPages = Math.ceil(bookmarks.length / BOOKMARKS_PER_PAGE);
  const currentPage = (page !== undefined && page >= 0 && page < totalPages) ? page : 0;
  const idx = (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < bookmarks.length) ? selectedIndex : -1;
  const ctx: EditContext = { bookmarks, currentPage, totalPages, selectedIndex: idx, editingField: undefined };
  await setEditContext(chatId, ctx);
  return ctx;
}

const HELP_TEXT = [
  '📖 <b>Available commands:</b>',
  '',
  '<code>/start CODE</code> — Link your Pinboard account',
  '<code>/list</code> or <code>/bookmarks</code> — Browse your bookmarks',
  '<code>/help</code> — Show this message',
  '',
  '<b>Save a bookmark:</b> Send any URL',
  '',
  '<b>Edit a bookmark:</b>',
  '1. /list → tap a number',
  '2. Tap ✏️ Edit → choose a field',
  '3. Send the new value'
].join('\n');

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

  console.log(
    'Telegram webhook: update_id=', update.update_id,
    'has_message=', !!update.message,
    'has_callback=', !!update.callback_query
  );

  // ---- CALLBACK QUERY PATH (inline keyboard button presses) ----
  const callbackQuery = update.callback_query;
  if (callbackQuery && callbackQuery.data) {
    const cbMessage = callbackQuery.message;
    if (!cbMessage?.chat?.id) {
      await answerCallbackQuery(botToken, callbackQuery.id, 'Error: no chat');
      return NextResponse.json({ ok: true });
    }

    const chatId = cbMessage.chat.id;
    const telegramId = String(callbackQuery.from.id);
    const cbData = callbackQuery.data;
    const messageId = cbMessage.message_id;

    try {
      const apiToken = await getApiTokenByTelegramId(telegramId);
      if (!apiToken) {
        await answerCallbackQuery(botToken, callbackQuery.id, 'Not linked');
        await sendTelegramMessage(botToken, chatId, 'This chat is not linked. Use /start CODE to link your Pinboard account.');
        return NextResponse.json({ ok: true });
      }

      if (cbData === 'noop') {
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      const ctx = await getEditContext(chatId);

      // ---- STATELESS CALLBACKS (work without stored context) ----

      // Page navigation — re-fetch if context expired
      if (cbData.startsWith('page:')) {
        const page = parseInt(cbData.slice(5), 10);
        if (isNaN(page) || page < 0) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          return NextResponse.json({ ok: true });
        }
        const effectiveCtx = ctx && page < ctx.totalPages ? ctx : await rebuildContext(chatId, apiToken);
        if (!effectiveCtx || page >= effectiveCtx.totalPages) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          return NextResponse.json({ ok: true });
        }
        effectiveCtx.currentPage = page;
        effectiveCtx.selectedIndex = -1;
        effectiveCtx.editingField = undefined;
        await setEditContext(chatId, effectiveCtx);

        await editTelegramMessage(botToken, chatId, messageId, buildListMessage(effectiveCtx), buildListKeyboard(effectiveCtx));
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      // Show bookmark detail — re-fetch if context expired
      if (cbData.startsWith('detail:')) {
        const idx = parseInt(cbData.slice(7), 10);
        if (isNaN(idx) || idx < 0) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          return NextResponse.json({ ok: true });
        }
        const effectiveCtx = ctx && idx < ctx.bookmarks.length ? ctx : await rebuildContext(chatId, apiToken, undefined, idx);
        if (!effectiveCtx || idx >= effectiveCtx.bookmarks.length) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          return NextResponse.json({ ok: true });
        }
        effectiveCtx.selectedIndex = idx;
        effectiveCtx.editingField = undefined;
        await setEditContext(chatId, effectiveCtx);

        await editTelegramMessage(botToken, chatId, messageId, buildDetailMessage(effectiveCtx), buildDetailKeyboard(effectiveCtx));
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      // Back to list — re-fetch if context expired
      if (cbData === 'back_to_list') {
        const effectiveCtx = ctx ?? await rebuildContext(chatId, apiToken);
        if (!effectiveCtx) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          await editTelegramMessage(botToken, chatId, messageId, '📚 You have no bookmarks yet. Send a URL to save your first one!');
          return NextResponse.json({ ok: true });
        }
        effectiveCtx.selectedIndex = -1;
        effectiveCtx.editingField = undefined;
        await setEditContext(chatId, effectiveCtx);

        await editTelegramMessage(botToken, chatId, messageId, buildListMessage(effectiveCtx), buildListKeyboard(effectiveCtx));
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      // ---- STATEFUL CALLBACKS (require stored context) ----
      // These involve the edit flow where we need to know exactly which bookmark
      // and which field the user was interacting with.

      if (!ctx) {
        await answerCallbackQuery(botToken, callbackQuery.id, 'Session expired');
        await sendTelegramMessage(botToken, chatId, '⚠️ Session expired. Use /list to browse your bookmarks again.');
        return NextResponse.json({ ok: true });
      }

      if (cbData === 'edit') {
        if (ctx.selectedIndex < 0 || ctx.selectedIndex >= ctx.bookmarks.length) {
          await answerCallbackQuery(botToken, callbackQuery.id, 'Invalid bookmark');
          return NextResponse.json({ ok: true });
        }

        const b = ctx.bookmarks[ctx.selectedIndex];
        const title = escapeHtml(b.description || '(no title)');
        const notes = b.extended ? escapeHtml(b.extended.length > 80 ? b.extended.slice(0, 77) + '…' : b.extended) : '(none)';
        const tags = b.tags || '(none)';

        const editPrompt = [
          `✏️ <b>Edit:</b> ${title}`,
          '',
          `<b>Current values:</b>`,
          `• Title: <i>${title}</i>`,
          `• Notes: <i>${notes}</i>`,
          `• Tags: <i>${escapeHtml(tags)}</i>`,
          '',
          'What would you like to change?'
        ].join('\n');

        await editTelegramMessage(botToken, chatId, messageId, editPrompt, buildEditFieldKeyboard());
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      if (cbData.startsWith('edit:')) {
        const field = cbData.slice(5);
        if (!['title', 'extended', 'tags'].includes(field)) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          return NextResponse.json({ ok: true });
        }

        if (ctx.selectedIndex < 0 || ctx.selectedIndex >= ctx.bookmarks.length) {
          await answerCallbackQuery(botToken, callbackQuery.id, 'Invalid bookmark');
          return NextResponse.json({ ok: true });
        }

        ctx.editingField = field as 'title' | 'extended' | 'tags';
        await setEditContext(chatId, ctx);

        await editTelegramMessage(botToken, chatId, messageId, buildEditPromptMessage(ctx, field), buildEditBackToDetailKeyboard());
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      if (cbData === 'back_to_detail') {
        if (ctx.selectedIndex < 0 || ctx.selectedIndex >= ctx.bookmarks.length) {
          await answerCallbackQuery(botToken, callbackQuery.id);
          return NextResponse.json({ ok: true });
        }
        ctx.editingField = undefined;
        await setEditContext(chatId, ctx);

        await editTelegramMessage(botToken, chatId, messageId, buildDetailMessage(ctx), buildDetailKeyboard(ctx));
        await answerCallbackQuery(botToken, callbackQuery.id);
        return NextResponse.json({ ok: true });
      }

      await answerCallbackQuery(botToken, callbackQuery.id);
      return NextResponse.json({ ok: true });

    } catch (err) {
      console.error('Telegram webhook callback error:', err);
      await answerCallbackQuery(botToken, callbackQuery.id, 'Error');
      await sendTelegramMessage(botToken, chatId, 'Something went wrong. Please try again later.');
      return NextResponse.json({ ok: true });
    }
  }

  // ---- MESSAGE PATH ----
  const message = update.message;
  if (!message?.from?.id || !message.chat?.id) {
    return NextResponse.json({ ok: true });
  }

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
        '✅ <b>Linked!</b>\n\nSend a URL to save it to Pinbook.\nUse /list to browse your bookmarks.\nUse /help for all commands.'
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/start') {
      await sendTelegramMessage(
        botToken,
        chatId,
        'To connect this chat to Pinboard, get a code from Pinbook Settings → Connect Telegram, then send: <code>/start YOUR_CODE</code>\n\nOnce linked, send a URL to save it or use /list to browse your bookmarks.'
      );
      return NextResponse.json({ ok: true });
    }

    // /help
    if (text === '/help') {
      await sendTelegramMessage(botToken, chatId, HELP_TEXT);
      return NextResponse.json({ ok: true });
    }

    // /list or /bookmarks — browse bookmarks
    if (text === '/list' || text === '/bookmarks' || text.startsWith('/list ') || text.startsWith('/bookmarks ')) {
      const apiToken = await getApiTokenByTelegramId(telegramId);
      if (!apiToken) {
        await sendTelegramMessage(
          botToken,
          chatId,
          'This chat is not linked to Pinboard. Get a code from Pinbook Settings → Connect Telegram and send <code>/start YOUR_CODE</code>'
        );
        return NextResponse.json({ ok: true });
      }

      let targetPage = 0;
      const parts = text.split(' ');
      if (parts.length > 1) {
        const n = parseInt(parts[1], 10);
        if (!isNaN(n) && n > 0) {
          targetPage = n - 1;
        }
      }

      await clearPendingBookmark(chatId);

      const bookmarks = await getBookmarksServer(apiToken);
      if (bookmarks.length === 0) {
        await sendTelegramMessage(
          botToken,
          chatId,
          '📚 You have no bookmarks yet. Send a URL to save your first one!'
        );
        return NextResponse.json({ ok: true });
      }

      const totalPages = Math.ceil(bookmarks.length / BOOKMARKS_PER_PAGE);

      if (targetPage >= totalPages) {
        targetPage = 0;
      }

      const ctx: EditContext = {
        bookmarks,
        currentPage: targetPage,
        totalPages,
        selectedIndex: -1,
        editingField: undefined
      };
      await setEditContext(chatId, ctx);

      const listText = buildListMessage(ctx);
      const listKeyboard = buildListKeyboard(ctx);
      await sendTelegramMessage(botToken, chatId, listText, listKeyboard);
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

    // Check if user is in the middle of editing a bookmark field
    const editCtx = await getEditContext(chatId);
    if (editCtx?.editingField && editCtx.selectedIndex >= 0 && editCtx.selectedIndex < editCtx.bookmarks.length) {
      const b = editCtx.bookmarks[editCtx.selectedIndex];
      const field = editCtx.editingField;
      const newValue = text;

      const updateParams: AddBookmarkParams = {
        url: b.href,
        description: b.description,
        extended: b.extended || '',
        tags: b.tags || ''
      };

      if (field === 'title') {
        updateParams.description = newValue;
      } else if (field === 'extended') {
        updateParams.extended = newValue;
      } else if (field === 'tags') {
        updateParams.tags = parseTagsInput(newValue);
      }

      const result = await updateBookmarkServer(apiToken, updateParams);

      if (result.ok) {
        if (field === 'title') {
          editCtx.bookmarks[editCtx.selectedIndex].description = newValue;
        } else if (field === 'extended') {
          editCtx.bookmarks[editCtx.selectedIndex].extended = newValue;
        } else if (field === 'tags') {
          editCtx.bookmarks[editCtx.selectedIndex].tags = parseTagsInput(newValue);
        }
        editCtx.editingField = undefined;
        await setEditContext(chatId, editCtx);

        const detailText = buildDetailMessage(editCtx);
        await sendTelegramMessage(
          botToken,
          chatId,
          `✅ <b>Updated!</b>\n\n${detailText}`,
          buildAfterUpdateKeyboard()
        );
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `❌ Failed to update: ${result.error ?? 'Unknown error'}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    const urlInMessage = extractFirstUrl(text);
    const pending = await getPendingBookmark(chatId);
    const hasRedis = await hasPersistentStore();
    console.log('Telegram webhook: chatId=', chatId, 'url=', !!urlInMessage, 'pending=', !!pending, 'hasRedis=', hasRedis);

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

    if (!urlInMessage) {
      await sendTelegramMessage(
        botToken,
        chatId,
        'Send a URL to save it or use /list to browse your bookmarks.\n\nExample: https://example.com/article'
      );
      return NextResponse.json({ ok: true });
    }

    const title = await fetchPageTitle(urlInMessage);
    const description = title ?? urlInMessage;

    const canAskForTags = await hasPersistentStore();
    console.log('Telegram webhook: canAskForTags=', canAskForTags, 'for chatId=', chatId);
    if (!canAskForTags) {
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

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
