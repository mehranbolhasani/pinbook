# Pinbook Changelog

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
  - Removed “Make Public/Private” share toggle from cards and lists; shared status is display-only
- Quality
  - Lint passes clean; removed unused imports and handlers

## 2025-11-17 — v0.1.0

- Initial private release
  - Bookmark loading from Pinboard API, tag fetching
  - List, card, and minimal views
  - Basic filtering, sorting, selection mode, and dialogs (Add/Edit/Delete)

