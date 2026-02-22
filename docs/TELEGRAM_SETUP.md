# Telegram bot setup (step-by-step)

This guide gets the “save links via Telegram” feature working from zero.

---

## 1. Create the bot in Telegram

1. Open Telegram and search for **@BotFather**.
2. Start a chat and send: **`/newbot`**
3. When asked for a name (e.g. “Pinbook”), type any display name and send.
4. When asked for a **username**, type one that ends in `bot`, e.g. **`MyPinbookBot`**. It must be unique.
5. BotFather will reply with a message that includes a **token** like:
   ```text
   123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. **Copy that token** and keep it. You’ll paste it into `.env.local` in the next step.
7. Note your bot’s **username** (e.g. `MyPinbookBot`) — you’ll need it for `TELEGRAM_BOT_USERNAME`.

---

## 2. Add variables to `.env.local`

In your project root, open or create **`.env.local`** and add these lines (use your real values):

```env
# Required for the Telegram feature
TELEGRAM_BOT_TOKEN=123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_BOT_USERNAME=MyPinbookBot

# Your app’s public URL (needed when setting the webhook)
# Local: use an ngrok URL (see step 4). Production: use your real domain, e.g. https://pinbook.vercel.app
PINBOOK_BASE_URL=https://your-public-url-here.com
```

- Replace **`123456789:AAH...`** with the token from BotFather.
- Replace **`MyPinbookBot`** with the bot username you chose.
- **`PINBOOK_BASE_URL`** must be the full base URL (no trailing slash) where Pinbook is reachable from the internet. For local dev you’ll use something like `https://abc123.ngrok.io` (see step 4).

Optional:

```env
# Recommended in production so only your server can receive webhooks
TELEGRAM_WEBHOOK_SECRET=some-random-string-you-make-up
```

Save the file. **Do not commit `.env.local`** (it’s gitignored).

---

## 3. Redis (link codes and “connected” state)

- **Local testing:** You can skip this. The app will use an in-memory store. It works, but link codes and “Telegram connected” state are lost when you restart the dev server.
- **Production (e.g. Vercel):** You need a store so codes and links persist.

**Option A – Upstash (simple, free tier):**

1. Go to [upstash.com](https://upstash.com) and sign up.
2. Create a **Redis** database (e.g. in “Global” or your region).
3. Open the database and copy **REST URL** and **REST Token**.
4. Add to `.env.local` (and to your host’s env in production):

   ```env
   KV_REST_URL=https://xxxxx.upstash.io
   KV_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 4. Expose your app to the internet (so Telegram can call your webhook)

Telegram sends updates to a **public URL**. So your app must be reachable at that URL.

- **If you’re already deployed** (e.g. Vercel): use that URL as `PINBOOK_BASE_URL` and go to step 5.
- **If you’re only running locally** (`npm run dev`): use a tunnel so Telegram can reach `localhost`.

**Local tunnel with ngrok (one option):**

1. Install [ngrok](https://ngrok.com/download) and sign up (free).
2. Run your app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. ngrok will show a URL like **`https://abc123.ngrok-free.app`**. Use that as your public URL.
5. In `.env.local` set:
   ```env
   PINBOOK_BASE_URL=https://abc123.ngrok-free.app
   ```
   (Use your actual ngrok URL; it changes on the free tier each time you restart ngrok.)

---

## 5. Set the webhook (tell Telegram where to send updates)

From your **project root**, run the script once. It needs `TELEGRAM_BOT_TOKEN` and your public base URL.

**Important — use the URL that does not redirect:**  
If your site redirects (e.g. `pinbook.xyz` → `www.pinbook.xyz` or the other way), set `PINBOOK_BASE_URL` to the **final** URL you see in the browser (the one that doesn’t change). Telegram sends POST with a body; if the webhook URL redirects (307/301), the request can break and the bot will never receive updates. So use e.g. `https://www.pinbook.xyz` if that’s your canonical domain, not `https://pinbook.xyz` if that redirects.

**If `.env.local` is in the project root**, you can load it and run:

```bash
# From project root (Unix/macOS)
export $(grep -v '^#' .env.local | xargs)
node scripts/set-telegram-webhook.mjs
```

On Windows (PowerShell) you can set vars manually, then run the script:

```powershell
$env:TELEGRAM_BOT_TOKEN = "your_token_here"
$env:PINBOOK_BASE_URL = "https://your-url.com"
node scripts/set-telegram-webhook.mjs
```

The script reads `TELEGRAM_BOT_TOKEN` and `PINBOOK_BASE_URL` (or `BASE_URL`) from the environment. If you use `TELEGRAM_WEBHOOK_SECRET`, it will send that to Telegram too.

**Or** set variables inline:

```bash
TELEGRAM_BOT_TOKEN=123456789:AAHxxx... PINBOOK_BASE_URL=https://your-url.com node scripts/set-telegram-webhook.mjs
```

**Or** pass the URL as an argument (token still from env):

```bash
export TELEGRAM_BOT_TOKEN=123456789:AAHxxx...
node scripts/set-telegram-webhook.mjs https://your-url.com
```

You should see: **`Webhook set successfully.`**

If you change your app URL (e.g. new ngrok URL or new domain), run this script again with the new `PINBOOK_BASE_URL`.

---

## 6. Connect Telegram in Pinbook

1. Open Pinbook in the browser (your local URL or production URL).
2. Log in with your Pinboard API token if you haven’t already.
3. Go to **Settings** (e.g. from the nav or `/settings`).
4. Find the **Telegram** card and click **“Connect Telegram”**.
5. A **code** will appear (e.g. `ABC123`), and it will say something like: “Send this in Telegram: `/start ABC123`”.
6. Open Telegram, find your bot (search for the username you set, e.g. `@MyPinbookBot`), and send exactly:
   ```text
   /start ABC123
   ```
   (Use the real code shown in Pinbook; it expires in about 10 minutes.)
7. The bot should reply that it’s linked. In Pinbook Settings, the Telegram card should show **Connected**.

---

## 7. Use it

In that same Telegram chat with your bot, send **any message that contains a link**, e.g.:

```text
https://example.com/article
```

or:

```text
Check this out https://news.ycombinator.com
```

The bot will fetch the page title, ask for tags (reply with tags or /skip), then save to Pinboard. Example: “Saved to Pinboard: …”.

---

## Quick checklist

- [ ] Bot created with @BotFather; token and username copied
- [ ] `.env.local` has `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, and `PINBOOK_BASE_URL`
- [ ] (Production) Redis: `KV_REST_URL` and `KV_REST_TOKEN` in env
- [ ] App is reachable at `PINBOOK_BASE_URL` (deployed or ngrok)
- [ ] Ran `node scripts/set-telegram-webhook.mjs` (or with env vars) and saw “Webhook set successfully”
- [ ] In Pinbook: Settings → Telegram → Connect Telegram, then sent `/start CODE` to the bot in Telegram
- [ ] Sent a test URL to the bot and got a “Saved” reply

---

## Troubleshooting

- **Bot never replies (no message at all)**  
  - **307 redirect on webhook:** In Vercel (or other hosts) you may see `GET /api/telegram/webhook` with status **307**. That usually means the webhook URL you gave Telegram redirects (e.g. `pinbook.xyz` → `www.pinbook.xyz`). Telegram sends **POST** to your URL; after a redirect the request can break and the body is lost, so the bot never gets the message. **Fix:** Set the webhook to the URL that does **not** redirect. Open your app in the browser and check the address bar: use that exact base URL (e.g. `https://www.pinbook.xyz`) in `PINBOOK_BASE_URL` and run `node scripts/set-telegram-webhook.mjs` again.
  - **Webhook secret:** If you set `TELEGRAM_WEBHOOK_SECRET` in env, Telegram must send the same value when it calls your webhook. When you ran the webhook script, you must have passed that secret (e.g. `node scripts/set-telegram-webhook.mjs https://your-url.com your-secret`). If they don’t match, the server returns 401 and the bot sends nothing. Fix: run the script again with the same secret, or remove `TELEGRAM_WEBHOOK_SECRET` and run the script without a secret.
  - **One environment for link + webhook:** The bot has a single webhook URL (whichever you last set). Use **one** environment for both “Connect Telegram” and receiving messages. If the webhook points to **production**, do “Connect Telegram” in the **production** Pinbook (and use production Redis). If you connected on local but the webhook points to prod, prod doesn’t have your link/code data, so you’ll get “invalid code” or “not linked” — and if something else fails, no reply. Stick to prod for both, or local+ngrok for both.
  - **Check server logs:** When you send a message to the bot, the server should log something like `Telegram webhook: update_id=... chat_id=... text=...`. If you never see that, Telegram isn’t reaching your app (wrong URL, app down, or redirect). If you see that but no reply, check for errors right after (e.g. `TELEGRAM_BOT_TOKEN` invalid, or `Telegram sendMessage failed`).

- **“This code is invalid or expired”**  
  Generate a new code in Settings → Telegram → Connect Telegram and send the new `/start CODE` within a few minutes. If you’re not using Redis, restarting the dev server invalidates old codes. If you linked on local but the webhook is set to prod (or the other way around), the server that receives the message doesn’t have the code — use the same environment for connecting and for the webhook.

- **“This chat is not linked”** when sending a URL  
  Complete the linking step: get a code in Settings and send `/start CODE` to the bot (on the same Pinbook environment where the webhook is set).

- **Webhook script fails or bot never replies**  
  - Check that `PINBOOK_BASE_URL` is exactly the base URL (no `/api/...`). The script appends `/api/telegram/webhook`.
  - Ensure the app is running and reachable at that URL (open `PINBOOK_BASE_URL` in a browser).
  - For local dev, ensure ngrok is running and `PINBOOK_BASE_URL` matches the ngrok URL.

- **Bot replies “Something went wrong”**  
  Check the Pinbook server logs (terminal or host logs). Typical causes: missing or wrong Pinboard API token when the user linked, or Redis/env not set in production.
