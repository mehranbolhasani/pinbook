/**
 * Send a text message to a Telegram chat. Used from the webhook handler.
 */

import type { InlineKeyboardMarkup } from './types';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyMarkup?: InlineKeyboardMarkup
): Promise<{ message_id: number }> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('Telegram sendMessage failed:', res.status, body);
    throw new Error(`Telegram API: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { result?: { message_id: number } };
  return { message_id: data.result?.message_id ?? 0 };
}

export async function editTelegramMessage(
  botToken: string,
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: InlineKeyboardMarkup
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/editMessageText`;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML'
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const body = await res.text();
    // 400 often means "message is not modified" — not a real error
    if (res.status === 400 && body.includes('message is not modified')) {
      return;
    }
    console.error('Telegram editMessageText failed:', res.status, body);
  }
}

export async function answerCallbackQuery(
  botToken: string,
  callbackQueryId: string,
  text?: string
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text })
  });
}
