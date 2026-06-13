# Pinbook — Agent Guide

## Commands
- `npm run dev` — Next.js 16 dev server with Turbopack
- `npm run build` — production build with Turbopack
- `npm run start` — production server
- `npm run lint` — ESLint only (no Prettier in this repo)
- `npm run typecheck` — `tsc --noEmit`
- No test framework; no test scripts or dependencies

## Stack & config
- Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS v4, shadcn/ui **New York**
- Tailwind theme lives in `src/app/globals.css` (`@theme inline`); there is **no `tailwind.config.ts`**
- Icons are **`@nine-thirty-five/material-symbols-react/rounded/300`**, not `lucide-react`
  - `components.json` still says `"iconLibrary": "lucide"`; when adding shadcn components, replace any `lucide-react` imports with material-symbols
- Animation library is **`motion`** (the Motion One React package), not `framer-motion`
- Path alias `@/*` → `./src/*`; shadcn components live under `@/components/ui/*`

## State & data fetching
- **`useAuthStore`** (`@/lib/stores/auth.ts`) — username, apiToken, login/logout. Persisted to localStorage.
- **`useUIStore`** (`@/lib/stores/ui.ts`) — search query, selected tags, page. Uses Zustand persist but with an empty partializer, so search + tag filters reset on reload.
- **`useBookmarkStore`** — legacy and removed. Do NOT reintroduce.
- Always use React Query hooks from `@/hooks/usePinboard` (`useBookmarks`, `useTags`, `useAddBookmark`, `useUpdateBookmark`, `useDeleteBookmark`). Never call the Pinboard API directly from components.
- All mutations use optimistic updates with rollback on error.
- Pinboard API wrapper is `@/lib/api/pinboard.ts`; it calls the local `/api/pinboard` proxy, which is allow-listed (`/posts/all`, `/posts/recent`, `/posts/add`, `/posts/delete`, `/tags/get`, `/posts/search`) and rate-limited to 60 req/min.
- **Pinboard API quirk:** `description` = bookmark *title*, `extended` = bookmark *description*.
- `next.config.ts` sets a strict CSP; `connect-src` is limited to `'self'` and `https://api.pinboard.in`.

## Removed features (do not re-implement)
- Read/Unread toggles, badges, filters
- Recent filter
- Make Public/Private toggle (shared status is display-only)
- Hamburger menu on mobile
- Separate sort and filter buttons on mobile (combined into `MobileSidebar`)
- Sort (by date/title/url, ascending/descending) — bookmarks display in API default order

## Mobile conventions
- Breakpoint is `lg` (1024px). Mobile `< 1024px`, Desktop `≥ 1024px`.
- Mobile nav: `MobileNav` (header + bottom bar), `MobileSidebar` (filter sheet), `MobileAddBookmark` (add sheet).
- Sheets use `side="bottom"` at `80vh` (filter) or `90vh` (add) with `SheetHeader`/`SheetTitle`.
- Mobile-only: `lg:hidden`. Desktop-only: `hidden lg:block`/`hidden lg:flex`.
- Touch targets: minimum `h-10 w-10` (40×40px), preferably 44×44px.

## Keyboard shortcuts
Search (`Cmd/Ctrl+K`), Add (`Cmd/Ctrl+N`), Close (`Esc`), Arrow up/down navigation, Open (`Enter`), Edit (`E`), Help (`?`). See `useKeyboardShortcuts` hook.

## Telegram bot
- API routes at `/api/telegram/*`. Setup script: `scripts/set-telegram-webhook.mjs`.
- Optional Upstash Redis for production; falls back to in-memory (resets on restart, dev only).
- Full setup guide: `docs/TELEGRAM_SETUP.md`.

## Performance
- Virtualization kicks in above 75 bookmarks (`useVirtualizationThreshold`).
- No `ScrollArea` component — use `overflow-y-auto` for scrolling.
- Search is debounced via `@/lib/utils/debounce.ts`.

## Documentation
- `changelog.md` — update for user-facing changes
- `dev-notes.md` — update for technical decisions (gitignored, local only)

## Environment
- `.env.local` for local secrets (gitignored via `.env*`)
- `.env.example` documents available vars
