#!/usr/bin/env node
/**
 * Set the Telegram bot webhook to your Pinbook app.
 *
 * Usage:
 *   # With env vars (e.g. from .env.local, or export them):
 *   TELEGRAM_BOT_TOKEN=123:ABC PINBOOK_BASE_URL=https://your-app.vercel.app node scripts/set-telegram-webhook.mjs
 *
 *   # Or with optional webhook secret:
 *   TELEGRAM_BOT_TOKEN=... PINBOOK_BASE_URL=... TELEGRAM_WEBHOOK_SECRET=mysecret node scripts/set-telegram-webhook.mjs
 *
 *   # Or pass base URL as first argument (and optional secret as second):
 *   node scripts/set-telegram-webhook.mjs https://your-app.vercel.app [optional-secret]
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const baseUrl = process.env.PINBOOK_BASE_URL || process.env.BASE_URL || process.argv[2];
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || process.argv[3];

if (!token || !baseUrl) {
  console.error('Usage: set TELEGRAM_BOT_TOKEN and your app base URL.');
  console.error('  TELEGRAM_BOT_TOKEN=xxx PINBOOK_BASE_URL=https://your-domain.com node scripts/set-telegram-webhook.mjs');
  console.error('  or: node scripts/set-telegram-webhook.mjs <base_url> [secret]');
  console.error('  (token must be in TELEGRAM_BOT_TOKEN env var)');
  process.exit(1);
}

const webhookUrl = baseUrl.replace(/\/$/, '') + '/api/telegram/webhook';
const setUrl = new URL(`https://api.telegram.org/bot${token}/setWebhook`);
setUrl.searchParams.set('url', webhookUrl);
if (secret) setUrl.searchParams.set('secret_token', secret);

const res = await fetch(setUrl.toString(), { method: 'GET' });
const data = await res.json();

if (!data.ok) {
  console.error('Telegram API error:', data);
  process.exit(1);
}

console.log('Webhook set successfully.');
console.log('  URL:', webhookUrl);
if (secret) console.log('  Secret token: set');
