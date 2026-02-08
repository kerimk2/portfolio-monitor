'use client';

import { useState, useEffect } from 'react';
import { WatchlistItem, AnalyzeResponse } from '@/types/watchlist';
import { WatchlistCard } from '@/components/watchlist-card';
import { Loader2 } from 'lucide-react';

export function WatchlistDashboard() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [progress, setProgress] = useState('');
  const [errors, setErrors] = useState<{ ticker: string; error: string }[]>([]);
  const [reanalyzing, setReanalyzing] = useState<string | null>(null);

  // Load saved watchlist on mount
  useEffect(() => {
    fetch('/api/watchlist')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(console.error)
      .finally(() => setLoadingSaved(false));
  }, []);

  const parseTickers = (text: string): string[] => {
    return text
      .split(/[\s,;\n/]+/)
      .map((t) => t.trim().toUpperCase().replace(/[^A-Z.]/g, ''))
      .filter((t) => t.length > 0 && t.length <= 10)
      .filter((t, i, arr) => arr.indexOf(t) === i); // deduplicate
  };

  const handleAnalyze = async () => {
    const tickers = parseTickers(input);
    if (tickers.length === 0) return;

    setLoading(true);
    setErrors([]);
    setProgress(`Analyzing ${tickers.length} ticker${tickers.length > 1 ? 's' : ''}... This may take a moment.`);

    try {
      const res = await fetch('/api/watchlist/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });

      const data: AnalyzeResponse = await res.json();

      if (data.results) {
        setItems((prev) => {
          const existing = new Map(prev.map((item) => [item.ticker, item]));
          for (const result of data.results) {
            existing.set(result.ticker, result);
          }
          return Array.from(existing.values());
        });
      }

      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }

      setInput('');
    } catch (err) {
      setErrors([{ ticker: 'ALL', error: err instanceof Error ? err.message : 'Request failed' }]);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleRemove = async (ticker: string) => {
    setItems((prev) => prev.filter((item) => item.ticker !== ticker));

    try {
      await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleReanalyze = async (ticker: string) => {
    setReanalyzing(ticker);

    try {
      // Delete cached version first so the API fetches fresh data
      await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });

      const res = await fetch('/api/watchlist/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: [ticker] }),
      });

      const data: AnalyzeResponse = await res.json();

      if (data.results && data.results.length > 0) {
        setItems((prev) =>
          prev.map((item) => (item.ticker === ticker ? data.results[0] : item))
        );
      }
    } catch (err) {
      console.error('Failed to re-analyze:', err);
    } finally {
      setReanalyzing(null);
    }
  };

  const handleClearAll = async () => {
    for (const item of items) {
      await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: item.ticker }),
      });
    }
    setItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste stock tickers
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Paste tickers separated by commas, spaces, or new lines\ne.g. AAPL, MSFT, GOOGL, AMZN, META"}
          className="w-full h-28 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={loading}
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || input.trim().length === 0}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={loading}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
          {input.trim().length > 0 && (
            <span className="text-sm text-gray-400">
              {parseTickers(input).length} ticker{parseTickers(input).length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-blue-700 text-sm">{progress}</span>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-red-800 font-medium text-sm mb-1">Some tickers failed:</h3>
          {errors.map((err, i) => (
            <p key={i} className="text-red-600 text-sm">
              <span className="font-mono font-medium">{err.ticker}</span>: {err.error}
            </p>
          ))}
        </div>
      )}

      {/* Loading saved */}
      {loadingSaved && (
        <div className="text-center py-8 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading saved watchlist...
        </div>
      )}

      {/* Results - stacked cards */}
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <WatchlistCard
              key={item.ticker}
              item={item}
              onRemove={handleRemove}
              onReanalyze={handleReanalyze}
              reanalyzing={reanalyzing === item.ticker}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loadingSaved && items.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No stocks in your watchlist yet.</p>
          <p className="text-sm mt-1">Paste some tickers above and click Analyze to get started.</p>
        </div>
      )}
    </div>
  );
}
