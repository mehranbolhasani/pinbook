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

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN.');
  console.error('  - From project root, add it to .env.local and run: node scripts/set-telegram-webhook.mjs');
  console.error('  - Or set TELEGRAM_BOT_TOKEN env var and run: node scripts/set-telegram-webhook.mjs');
  process.exit(1);
}

// 1. Set webhook
if (baseUrl) {
  const webhookUrl = baseUrl.replace(/\/$/, '') + '/api/telegram/webhook';
  const setUrl = new URL(`https://api.telegram.org/bot${token}/setWebhook`);
  setUrl.searchParams.set('url', webhookUrl);
  if (secret) setUrl.searchParams.set('secret_token', secret);

  const res = await fetch(setUrl.toString(), { method: 'GET' });
  const data = await res.json();

  if (!data.ok) {
    console.error('Telegram setWebhook error:', data);
    process.exit(1);
  }

  console.log('Webhook set successfully.');
  console.log('  URL:', webhookUrl);
  if (secret) console.log('  Secret token: set');
} else {
  console.log('Skipping webhook setup (no PINBOOK_BASE_URL provided).');
}

// 2. Set bot commands
const commands = [
  { command: 'list', description: 'Browse your bookmarks' },
  { command: 'bookmarks', description: 'Browse your bookmarks' },
  { command: 'start', description: 'Link your Pinboard account' },
  { command: 'help', description: 'Show all commands' }
];

const commandsRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ commands })
});
const commandsData = await commandsRes.json();

if (!commandsData.ok) {
  console.error('Telegram setMyCommands error:', commandsData);
  process.exit(1);
}

console.log('Bot commands set successfully:');
commands.forEach(c => console.log(`  /${c.command} — ${c.description}`));
