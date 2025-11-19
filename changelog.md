# Pinbook Changelog

## 2025-11-19 — v0.3.0 - Mobile Navigation Overhaul

### Mobile Experience Redesign

- **Complete mobile navigation redesign** with improved UX and consolidated controls
  - Removed hamburger menu entirely
  - Added functional search bar in mobile header
  - Added theme toggle to mobile header
  - Changed logo icon to Paperclip (consistent with desktop)

### Mobile Bottom Bar

- **Reorganized bottom navigation bar** with better layout:
  - Layout controls (Card/List/Minimal) on the left
  - Combined Sort/Filter button in center
  - Add bookmark button on the far right (highlighted with default variant)
- Improved button styling and spacing for better touch targets
- Increased backdrop blur opacity for better visibility

### Sort & Filter Pane

- **Created unified Sort/Filter bottom sheet** combining both functionalities:
  - Sort section at top with grid buttons (Date/Title/URL)
  - Sort order buttons (Ascending/Descending)
  - Separator dividing sort and filter sections
  - Filter section with all tags visible by default (no expand/collapse)
  - Tag counts displayed as badges
  - Clear All Filters button when filters are active
- Fixed accessibility warnings by using proper SheetHeader and SheetTitle components
- Removed double close button issue (Sheet provides built-in close)

### Add Bookmark Experience

- **Created mobile-optimized add bookmark sheet** matching filter pane style:
  - Opens from bottom as a sheet (90vh height)
  - Consistent header with SheetTitle
  - Scrollable form content area
  - All fields from desktop version (URL, title, description, notes, tags, sharing)
  - Auto-fetch title from URL
  - Tag management with badges
  - Action buttons at bottom (Cancel/Add)
  - Full-width buttons for easy mobile tapping

### Desktop Improvements

- **Hidden desktop toolbar on mobile** since controls moved to bottom bar
- Search input remains visible on desktop only
- Maintained all desktop functionality unchanged

### Bug Fixes

- Fixed filter pane errors (removed non-existent ScrollArea component)
- Fixed mobile-sidebar using wrong store (changed from useBookmarkStore to useUIStore)
- Fixed TypeScript errors with icon components in settings page
- Fixed Tailwind CSS lint warnings (flex-shrink-0 → shrink-0, supports-backdrop-filter syntax)
- Resolved all accessibility warnings in Sheet components

### Technical Changes

- Created new component: `mobile-add-bookmark.tsx`
- Completely rewrote: `mobile-nav.tsx`
- Simplified: `mobile-sidebar.tsx` (now handles both sort and filter)
- Updated: `bookmark-list.tsx` (hide toolbar on mobile)
- Updated: `settings/page.tsx` (mobile responsive improvements)

## 2025-11-18 — v0.2.0

- Simplified UI and filters
  - Removed Read/Unread feature everywhere (buttons, badges, bulk actions, context menus)
  - Removed Recent filter from sidebars and filtering logic
  - Tags sections default to closed in both desktop and mobile sidebars
- Navigation and actions
  - Merged header functionality into the desktop sidebar (logo, theme toggle, search, user actions)
  - Updated keyboard shortcuts: removed the Read/Unread toggle (R)
  - Mobile card gestures: right swipe opens the link; removed left-swipe read action
- Cards and lists
  - Removed "Make Public/Private" share toggle from cards and lists; shared status is display-only
- Quality
  - Lint passes clean; removed unused imports and handlers

## 2025-11-17 — v0.1.0

- Initial private release
  - Bookmark loading from Pinboard API, tag fetching
  - List, card, and minimal views
  - Basic filtering, sorting, selection mode, and dialogs (Add/Edit/Delete)
