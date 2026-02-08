import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { WatchlistItem } from '@/types/watchlist';

const STORE_PATH = join(process.cwd(), 'data', 'watchlist.json');

function ensureDir() {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
}

export function loadWatchlist(): WatchlistItem[] {
  try {
    if (!existsSync(STORE_PATH)) return [];
    const raw = readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]): void {
  ensureDir();
  writeFileSync(STORE_PATH, JSON.stringify(items, null, 2));
}

export function upsertItem(item: WatchlistItem): WatchlistItem {
  const items = loadWatchlist();
  const index = items.findIndex((i) => i.ticker === item.ticker);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  saveWatchlist(items);
  return item;
}

export function deleteItem(ticker: string): void {
  const items = loadWatchlist();
  const filtered = items.filter((i) => i.ticker !== ticker.toUpperCase());
  saveWatchlist(filtered);
}

export function getItem(ticker: string): WatchlistItem | undefined {
  const items = loadWatchlist();
  return items.find((i) => i.ticker === ticker.toUpperCase());
}
