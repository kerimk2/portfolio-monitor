import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { WatchlistDashboard } from '@/components/watchlist-dashboard';

export const metadata: Metadata = {
  title: 'Stock Watchlist | BDC Portfolio Screener',
  description: 'Analyze any stock ticker with AI-powered insights',
};

export default function WatchlistPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:underline mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to BDC Screener
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Watchlist</h1>
          <p className="text-gray-600 mt-2">
            Paste stock tickers to get instant financial analysis and AI-powered insights.
          </p>
        </div>

        <WatchlistDashboard />
      </div>
    </main>
  );
}
