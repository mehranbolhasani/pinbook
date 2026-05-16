/** Minimal Telegram Bot API types for webhook handling */

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramMessage {
  message_id: number;
  from?: { id: number; username?: string; first_name?: string };
  chat: { id: number; type: string };
  text?: string;
  entities?: { offset: number; length: number; type: string }[];
}

export interface TelegramCallbackQuery {
  id: string;
  from: { id: number; username?: string; first_name?: string };
  message?: TelegramMessage;
  chat_instance?: string;
  data?: string;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}
