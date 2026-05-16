import type { PinboardBookmark } from '@/types/pinboard';
import type { InlineKeyboardMarkup } from './types';
import type { EditContext } from './store';

const BOOKMARKS_PER_PAGE = 5;

function pageButton(text: string, page: number): { text: string; callback_data: string } {
  return { text, callback_data: `page:${page}` };
}

function detailButton(index: number): { text: string; callback_data: string } {
  return { text: String(index + 1), callback_data: `detail:${index}` };
}

export function buildListKeyboard(ctx: EditContext): InlineKeyboardMarkup {
  const { currentPage, totalPages, bookmarks } = ctx;
  const start = currentPage * BOOKMARKS_PER_PAGE;
  const end = Math.min(start + BOOKMARKS_PER_PAGE, bookmarks.length);
  const pageItems = bookmarks.slice(start, end);

  const rows: InlineKeyboardMarkup['inline_keyboard'] = [];

  if (pageItems.length > 0) {
    const btns = pageItems.map((_, i) => detailButton(start + i));
    // split into rows of 5 if needed
    const mid = Math.ceil(btns.length / 2);
    if (btns.length <= 3) {
      rows.push(btns);
    } else {
      rows.push(btns.slice(0, mid));
      if (btns.slice(mid).length > 0) {
        rows.push(btns.slice(mid));
      }
    }
  }

  const nav: InlineKeyboardMarkup['inline_keyboard'][number] = [];
  if (currentPage > 0) {
    nav.push(pageButton('⬅️ Prev', currentPage - 1));
  }
  nav.push({ text: `${currentPage + 1}/${totalPages}`, callback_data: 'noop' });
  if (currentPage < totalPages - 1) {
    nav.push(pageButton('➡️ Next', currentPage + 1));
  }
  rows.push(nav);

  return { inline_keyboard: rows };
}

export function buildDetailKeyboard(ctx: EditContext): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '✏️ Edit', callback_data: 'edit' },
        { text: '🔗 Open', url: ctx.bookmarks[ctx.selectedIndex].href }
      ],
      [{ text: '⬅️ Back to List', callback_data: 'back_to_list' }]
    ]
  };
}

export function buildEditFieldKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: 'Title', callback_data: 'edit:title' },
        { text: 'Notes', callback_data: 'edit:extended' },
        { text: 'Tags', callback_data: 'edit:tags' }
      ],
      [{ text: '⬅️ Back to Detail', callback_data: 'back_to_detail' }]
    ]
  };
}

export function buildEditBackToDetailKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: '⬅️ Back to Detail', callback_data: 'back_to_detail' }]
    ]
  };
}

export function buildAfterUpdateKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: '⬅️ Back to Detail', callback_data: 'back_to_detail' }],
      [{ text: '📋 Back to List', callback_data: 'back_to_list' }]
    ]
  };
}

export function buildListMessage(ctx: EditContext): string {
  const { currentPage, totalPages, bookmarks } = ctx;
  const start = currentPage * BOOKMARKS_PER_PAGE;
  const end = Math.min(start + BOOKMARKS_PER_PAGE, bookmarks.length);
  const pageItems = bookmarks.slice(start, end);

  const lines: string[] = [
    `📚 <b>Your Bookmarks</b> (page ${currentPage + 1}/${totalPages})`,
    ''
  ];

  pageItems.forEach((b, i) => {
    const idx = start + i + 1;
    const title = escapeHtml(b.description || '(no title)');
    const truncated = title.length > 100 ? title.slice(0, 97) + '…' : title;
    const domain = extractDomain(b.href);
    const tagStr = b.tags
      ? b.tags.split(' ').slice(0, 5).join(', ') + (b.tags.split(' ').length > 5 ? '...' : '')
      : 'none';

    lines.push(`${idx}. <b>${truncated}</b>`);
    lines.push(`   🌐 ${domain}`);
    lines.push(`   🏷️ ${escapeHtml(tagStr)}`);
    lines.push('');
  });

  return lines.join('\n');
}

export function buildDetailMessage(ctx: EditContext): string {
  const b = ctx.bookmarks[ctx.selectedIndex];
  if (!b) return 'Bookmark not found.';

  const title = escapeHtml(b.description || '(no title)');
  const extended = b.extended
    ? escapeHtml(b.extended.length > 200 ? b.extended.slice(0, 197) + '…' : b.extended)
    : '(none)';
  const tags = b.tags || 'none';

  return [
    `📎 <b>${title}</b>`,
    '',
    `🔗 <a href="${b.href}">${escapeHtml(truncateUrl(b.href))}</a>`,
    `📝 Notes: ${extended}`,
    `🏷️ Tags: ${escapeHtml(tags)}`
  ].join('\n');
}

export function buildEditPromptMessage(ctx: EditContext, field: string): string {
  const b = ctx.bookmarks[ctx.selectedIndex];
  if (!b) return 'Bookmark not found.';

  const title = escapeHtml(b.description || '(no title)');
  const fieldName = fieldToLabel(field);
  const currentValue = getCurrentValue(b, field);

  return [
    `✏️ Editing <b>${fieldName}</b> for:`,
    `${title}`,
    '',
    `Current: <i>${escapeHtml(String(currentValue).slice(0, 200))}</i>`,
    '',
    `Send the new ${fieldName.toLowerCase()}:`
  ].join('\n');
}

// Helpers

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 50);
  }
}

function truncateUrl(url: string): string {
  return url.length > 60 ? url.slice(0, 57) + '…' : url;
}

function fieldToLabel(field: string): string {
  switch (field) {
    case 'title': return 'Title';
    case 'extended': return 'Notes';
    case 'tags': return 'Tags';
    default: return field;
  }
}

function getCurrentValue(b: PinboardBookmark, field: string): string {
  switch (field) {
    case 'title': return b.description;
    case 'extended': return b.extended || '(none)';
    case 'tags': return b.tags || '(none)';
    default: return '';
  }
}
