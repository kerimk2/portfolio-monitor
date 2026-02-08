import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export interface BDCYahooData {
  price: number | null;
  dividend_yield: number | null;
  nav_per_share: number | null;
  debt_to_equity: number | null;
}

export async function fetchBDCData(ticker: string): Promise<BDCYahooData> {
  const result = await yf.quoteSummary(ticker.toUpperCase(), {
    modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData'],
  });

  const price = result.price?.regularMarketPrice ?? null;

  // dividendYield from summaryDetail is a decimal (0.10 = 10%), convert to percentage
  let dividend_yield: number | null = null;
  if (result.summaryDetail?.dividendYield != null) {
    dividend_yield = result.summaryDetail.dividendYield * 100;
  } else if (result.defaultKeyStatistics?.trailingAnnualDividendYield != null) {
    dividend_yield = Number(result.defaultKeyStatistics.trailingAnnualDividendYield) * 100;
  }

  // BDCs report assets at fair value, so book value per share ~= NAV per share
  const nav_per_share = result.defaultKeyStatistics?.bookValue ?? null;

  // debtToEquity from Yahoo is a percentage (120 = 1.2x), convert to ratio
  let debt_to_equity: number | null = null;
  if (result.financialData?.debtToEquity != null) {
    debt_to_equity = result.financialData.debtToEquity / 100;
  }

  return { price, dividend_yield, nav_per_share, debt_to_equity };
}
