import { FMPTickerData } from '@/types/watchlist';
import YahooFinance from 'yahoo-finance2';

const FMP_BASE = 'https://financialmodelingprep.com/stable';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function fetchTickerData(ticker: string): Promise<FMPTickerData> {
  const apiKey = process.env.FMP_API_KEY;
  const upperTicker = ticker.toUpperCase();

  // Fetch FMP profile (for description) + Yahoo Finance data in parallel
  const [profileRes, yahooRes, chartRes] = await Promise.allSettled([
    apiKey
      ? fetch(`${FMP_BASE}/profile?symbol=${upperTicker}&apikey=${apiKey}`).then((r) => r.json())
      : Promise.resolve([]),
    yf.quoteSummary(upperTicker, {
      modules: ['price', 'financialData', 'defaultKeyStatistics', 'summaryProfile'],
    }),
    fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upperTicker)}?range=1y&interval=1mo`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    ).then((r) => r.json()),
  ]);

  // Extract FMP profile data (mainly for company description)
  let fmpProfile: Record<string, string> = {};
  if (profileRes.status === 'fulfilled') {
    const data = profileRes.value;
    if (Array.isArray(data) && data.length > 0) {
      fmpProfile = data[0];
    }
  }

  // Extract Yahoo Finance data
  if (yahooRes.status === 'rejected') {
    throw new Error(`Ticker "${upperTicker}" not found`);
  }
  const yahoo = yahooRes.value;
  const price = yahoo.price;
  const fin = yahoo.financialData;
  const stats = yahoo.defaultKeyStatistics;
  const profile = yahoo.summaryProfile;

  if (!price?.regularMarketPrice) {
    throw new Error(`Ticker "${upperTicker}" not found`);
  }

  // Calculate YTD and 1Y performance from chart data
  let ytdChange = 0;
  let oneYearChange = 0;
  if (chartRes.status === 'fulfilled') {
    try {
      const result = chartRes.value?.chart?.result?.[0];
      if (result) {
        const closes = result.indicators?.quote?.[0]?.close || [];
        const timestamps = result.timestamp || [];
        const currentPrice = result.meta?.regularMarketPrice || price.regularMarketPrice || 0;

        if (closes.length > 0 && currentPrice > 0) {
          const firstClose = closes.find((c: number | null) => c !== null);
          if (firstClose) {
            oneYearChange = ((currentPrice - firstClose) / firstClose) * 100;
          }
          const currentYear = new Date().getFullYear();
          const jan1 = new Date(currentYear, 0, 1).getTime() / 1000;
          let ytdClose = firstClose;
          for (let i = 0; i < timestamps.length; i++) {
            if (timestamps[i] <= jan1 && closes[i] !== null) {
              ytdClose = closes[i];
            }
          }
          if (ytdClose) {
            ytdChange = ((currentPrice - ytdClose) / ytdClose) * 100;
          }
        }
      }
    } catch {
      // Chart data unavailable
    }
  }

  return {
    companyName: price.longName || price.shortName || fmpProfile.companyName || upperTicker,
    description: fmpProfile.description || profile?.longBusinessSummary || '',
    sector: (profile?.sector as string) || fmpProfile.sector || 'Unknown',
    industry: (profile?.industry as string) || fmpProfile.industry || 'Unknown',
    mktCap: price.marketCap || 0,
    price: price.regularMarketPrice || 0,
    revenue: fin?.totalRevenue || 0,
    netIncome: stats?.netIncomeToCommon || 0,
    eps: stats?.trailingEps || 0,
    peRatio: stats?.forwardPE || 0,
    pbRatio: stats?.priceToBook || 0,
    returnOnEquity: fin?.returnOnEquity || 0,
    evToEBITDA: stats?.enterpriseToEbitda || 0,
    ytdChange,
    oneYearChange,
  };
}
