Project Rules

Purpose
- Keep development consistent, secure, and maintainable across the Pinbook codebase.

Core Principles
- Favor simplicity: remove non-essential features and UI complexity.
- Be explicit: prefer clear, small APIs and straightforward data flow.
- Maintain performance: avoid unnecessary re-renders and heavy operations in lists.
- Security first: never log or expose secrets (API tokens, credentials).
- Consistency: follow existing patterns for components, stores, and API usage.

Tech Stack
- Next.js 15 (Turbopack), React 19, Tailwind CSS.
- shadcn/ui for primitives; lucide-react for icons.
- Zustand for state; Pinboard API client under `src/lib/api/pinboard.ts`.

Commands
- `npm run dev` — local development.
- `npm run build` — build.
- `npm run start` — production start.
- `npm run lint` — lint; must pass clean.

State & Data
- Use `useBookmarkStore` for bookmarks, tags, filtering, sorting, layout, selection.
- Use `useAuthStore` for authentication state and token management.
- Update local store first for responsive UI; then sync API when appropriate.

UI Conventions
- Components live under `src/components/...`; keep them client-only only when necessary.
- Use existing shadcn/ui components; maintain accessible labels and titles.
- Avoid banners/badges for deprecated features (Read/Unread); do not reintroduce.
- Shared status: `isShared` is display-only (no toggle UI).
- Sidebars: tags collapsed by default; no “Recent” or “Unread” quick filters.

Keyboard Shortcuts
- Active: Search (Cmd/Ctrl+K), Add (Cmd/Ctrl+N), Close (Esc), Navigate (Arrow keys), Open (Enter), Edit (E), Help (?).
- Removed: Read/Unread (R).

API Usage
- Wrap calls via `getPinboardAPI(apiToken)`; never access tokens directly.
- Add bookmark maps `shared` only; do not map `toread` for UI features.
- Keep `updateBookmarkReadStatus` unused in UI; do not surface controls for it.

SSR & Safety
- Guard any `window` or DOM access; use client components or runtime checks.
- Do not run browser-only code during SSR/Route handlers.

Quality Gates
- Lint clean is mandatory before merge.
- Remove unused imports, handlers, and dead code promptly.
- Prefer editing existing files over creating new ones unless explicitly needed.
- Do not commit secrets, tokens, or environment-specific data.

Versioning & Notes
- Public release notes go in `changelog.md`.
- Technical decisions and future considerations go in `dev-notes.md`.

Contribution Workflow
- Keep changes small and focused; explain rationale in PR description.
- Reference impacted files and lines when describing changes.
- Maintain UX consistency across desktop and mobile.
