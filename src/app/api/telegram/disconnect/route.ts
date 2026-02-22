import { NextRequest, NextResponse } from 'next/server';
import { disconnectByApiToken } from '@/lib/telegram/store';

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
    const removed = await disconnectByApiToken(apiToken);
    return NextResponse.json({ disconnected: removed });
  } catch (error) {
    console.error('Telegram disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
