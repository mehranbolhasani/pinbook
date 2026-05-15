# Pinbook — Agent Guide

## Commands
- `npm run dev` — starts dev server with Turbopack
- `npm run build` — production build with Turbopack
- `npm run lint` — ESLint only (no prettier)
- `npm run typecheck` — TypeScript type-check (`tsc --noEmit`)
- `npm start` — runs production server
- No test framework; no test scripts or dependencies

## Project structure
- Next.js 15 App Router, React 19, Tailwind CSS v4, shadcn/ui (New York style)
- Path alias `@/*` → `./src/*`
- `@/components/ui/*` for shadcn components
- `@/lib/utils.ts` — `cn()`, `formatDate()` helpers; also `@/lib/utils/debounce.ts`, `@/lib/utils/retry.ts`
- `@/types/pinboard.ts` — shared TypeScript types (`Bookmark`, `AddBookmarkParams`, `AuthState`, etc.)
- **Quirk:** `package.json` lists `"next": "^9.3.3"` — ignore that, the project actually uses Next.js 15.

## State & data fetching
- **`useAuthStore`** (`@/lib/stores/auth.ts`) — auth state (username, apiToken, login/logout). Persisted to localStorage.
- **`useUIStore`** (`@/lib/stores/ui.ts`) — all UI state (search query, selected tags, sort). Persisted via Zustand `partialize` — only `sortBy`/`sortOrder` survive reload; search + tag filters reset.
- **`useBookmarkStore`** — legacy, removed from codebase. Do NOT reintroduce.
- **Data fetching**: always use React Query hooks from `@/hooks/usePinboard` (`useBookmarks`, `useTags`, `useAddBookmark`, `useUpdateBookmark`, `useDeleteBookmark`). Never call the Pinboard API directly from components.
- All React Query mutations use **optimistic updates** with rollback on error.
- **`useFilteredBookmarks`** (`@/hooks/useFilteredBookmarks.ts`) — centralizes client-side filtering (by tags + search) and sorting. Used by the main page.
- Pinboard API wrapper at `@/lib/api/pinboard.ts`.
- **Pinboard API field quirk:** `description` maps to bookmark *title*, `extended` maps to bookmark *description*.

## Removed features (do not re-implement)
- Read/Unread toggles, badges, filters
- Recent filter
- Make Public/Private toggle (shared status is display-only)
- Hamburger menu on mobile
- Separate sort and filter buttons on mobile (combined into one `MobileSidebar` sheet)

## Mobile conventions
- Breakpoint: `lg` (1024px). Mobile `< 1024px`, Desktop `≥ 1024px`.
- Mobile nav: `MobileNav` (header + bottom bar), `MobileSidebar` (sort/filter sheet), `MobileAddBookmark` (bottom sheet).
- Use `side="bottom"` sheets (80vh for filter, 90vh for add) with `SheetHeader`/`SheetTitle`.
- Mobile-only: `lg:hidden`. Desktop-only: `hidden lg:block`/`hidden lg:flex`.
- Touch targets: minimum `h-10 w-10` (40×40px), preferably 44×44px.

## Keyboard shortcuts
Search (`Cmd/Ctrl+K`), Add (`Cmd/Ctrl+N`), Close (`Esc`), Arrow up/down navigation, Open (`Enter`), Edit (`E`), Help (`?`). See `useKeyboardShortcuts` hook.

## Telegram bot
- API routes at `/api/telegram/*`. Script: `scripts/set-telegram-webhook.mjs`.
- Optional Upstash Redis for production. Falls back to in-memory (resets on restart, dev only).
- Full setup guide: `docs/TELEGRAM_SETUP.md`.

## Performance
- `@tanstack/react-virtual` (`useVirtualizer`) available for list virtualization (100+ items).
- No `ScrollArea` component — use `overflow-y-auto` for scrolling.
- Debounced search via `@/lib/utils/debounce.ts`.

## Documentation
- `changelog.md` — update for user-facing changes
- `dev-notes.md` — update for technical decisions (gitignored, local only)

## Environment
- `.env.local` for local secrets (gitignored via `.env*`)
- `.env.example` documents available vars
