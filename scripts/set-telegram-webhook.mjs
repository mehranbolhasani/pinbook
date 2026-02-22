#!/usr/bin/env node
/**
 * Set the Telegram bot webhook to your Pinbook app.
 * Loads .env.local from the current directory if present.
 *
 * Usage:
 *   node scripts/set-telegram-webhook.mjs
 *   (with TELEGRAM_BOT_TOKEN and PINBOOK_BASE_URL in .env.local)
 *
 *   Or pass base URL: node scripts/set-telegram-webhook.mjs https://your-app.vercel.app [secret]
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env.local from project root (current working directory)
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const baseUrl = process.env.PINBOOK_BASE_URL || process.env.BASE_URL || process.argv[2];
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || process.argv[3];

if (!token || !baseUrl) {
  console.error('Missing TELEGRAM_BOT_TOKEN or PINBOOK_BASE_URL.');
  console.error('  - From project root, add them to .env.local and run: node scripts/set-telegram-webhook.mjs');
  console.error('  - Or run: node scripts/set-telegram-webhook.mjs <base_url>  (token still from .env.local)');
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
