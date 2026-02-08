import { NextRequest, NextResponse } from 'next/server';
import { fetchTickerData } from '@/lib/fmp';
import { analyzeWithClaude } from '@/lib/analyze-ticker';
import { WatchlistItem, AnalyzeResponse } from '@/types/watchlist';
import { getItem, upsertItem } from '@/lib/watchlist-store';

function isRecent(dateStr: string, hours: number): boolean {
  const analyzed = new Date(dateStr).getTime();
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return analyzed > cutoff;
}

export async function POST(request: NextRequest) {
  try {
    const { tickers } = await request.json();

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
    }

    if (tickers.length > 25) {
      return NextResponse.json({ error: 'Maximum 25 tickers at a time' }, { status: 400 });
    }

    const cleanTickers = tickers
      .map((t: string) => t.trim().toUpperCase())
      .filter((t: string) => t.length > 0 && t.length <= 10);

    const results: WatchlistItem[] = [];
    const errors: { ticker: string; error: string }[] = [];

    for (const ticker of cleanTickers) {
      try {
        // Check local cache first
        const cached = getItem(ticker);
        if (cached && cached.analyzed_at && isRecent(cached.analyzed_at, 24)) {
          results.push(cached);
          continue;
        }

        // Fetch fresh data from FMP
        const fmpData = await fetchTickerData(ticker);

        // Try AI analysis (gracefully handle failure)
        let analysis;
        try {
          analysis = await analyzeWithClaude(ticker, fmpData);
        } catch (aiErr) {
          console.warn(`AI analysis failed for ${ticker}:`, aiErr);
          analysis = {
            risks: ['AI analysis unavailable - check API key credits'],
            strengths: ['AI analysis unavailable - check API key credits'],
            evaluation: 'AI analysis could not be generated. Financial data shown above is from live market data.',
            revenue: 0, netIncome: 0, eps: 0, peRatio: 0, pbRatio: 0, evEbitda: 0,
          };
        }

        // Build the watchlist item
        const item: WatchlistItem = {
          id: crypto.randomUUID(),
          ticker,
          company_name: fmpData.companyName,
          description: fmpData.description,
          sector: fmpData.sector,
          industry: fmpData.industry,
          market_cap: fmpData.mktCap,
          price: fmpData.price,
          revenue: analysis.revenue || fmpData.revenue,
          net_income: analysis.netIncome || fmpData.netIncome,
          eps: analysis.eps || fmpData.eps,
          pe_ratio: analysis.peRatio || fmpData.peRatio,
          pb_ratio: analysis.pbRatio || fmpData.pbRatio,
          ev_ebitda: analysis.evEbitda || fmpData.evToEBITDA,
          roe: fmpData.returnOnEquity,
          ytd_change: fmpData.ytdChange,
          one_year_change: fmpData.oneYearChange,
          risks: analysis.risks,
          strengths: analysis.strengths,
          evaluation: analysis.evaluation,
          analyzed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        // Save to local JSON cache
        upsertItem(item);
        results.push(item);
      } catch (err) {
        errors.push({
          ticker,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const response: AnalyzeResponse = { results, errors };
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
