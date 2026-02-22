import { NextRequest, NextResponse } from 'next/server';
import { setCode } from '@/lib/telegram/store';

const CODE_LENGTH = 6;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiToken = typeof body?.apiToken === 'string' ? body.apiToken.trim() : null;
    if (!apiToken || !apiToken.includes(':')) {
      return NextResponse.json(
        { error: 'Invalid or missing apiToken' },
        { status: 400 }
      );
    }
    const code = generateCode();
    await setCode(code, apiToken);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'PinbookBot';
    return NextResponse.json({ code, botUsername });
  } catch (error) {
    console.error('Telegram request-code error:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
