/**
 * Send a text message to a Telegram chat. Used from the webhook handler.
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('Telegram sendMessage failed:', res.status, body);
    throw new Error(`Telegram API: ${res.status} ${body}`);
  }
}
