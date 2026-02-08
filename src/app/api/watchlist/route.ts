import { NextRequest, NextResponse } from 'next/server';
import { loadWatchlist, deleteItem } from '@/lib/watchlist-store';

export async function GET() {
  const items = loadWatchlist();
  return NextResponse.json(items);
}

export async function DELETE(request: NextRequest) {
  const { ticker } = await request.json();

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  deleteItem(ticker);
  return NextResponse.json({ success: true });
}
