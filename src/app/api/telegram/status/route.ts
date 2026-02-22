import { NextRequest, NextResponse } from 'next/server';
import { getTelegramIdByTokenHash } from '@/lib/telegram/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiToken = typeof body?.apiToken === 'string' ? body.apiToken.trim() : null;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'Missing apiToken' },
        { status: 400 }
      );
    }
    const telegramId = await getTelegramIdByTokenHash(apiToken);
    return NextResponse.json({
      connected: !!telegramId,
      telegramId: telegramId ?? undefined
    });
  } catch (error) {
    console.error('Telegram status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
