export interface WatchlistItem {
  id: string;
  ticker: string;
  company_name: string | null;
  description: string | null;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  price: number | null;
  revenue: number | null;
  net_income: number | null;
  eps: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  ev_ebitda: number | null;
  roe: number | null;
  ytd_change: number | null;
  one_year_change: number | null;
  risks: string[];
  strengths: string[];
  evaluation: string | null;
  analyzed_at: string;
  created_at: string;
}

export interface FMPTickerData {
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  mktCap: number;
  price: number;
  revenue: number;
  netIncome: number;
  eps: number;
  peRatio: number;
  pbRatio: number;
  returnOnEquity: number;
  evToEBITDA: number;
  ytdChange: number;
  oneYearChange: number;
}

export interface AIAnalysis {
  risks: string[];
  strengths: string[];
  evaluation: string;
  revenue: number;
  netIncome: number;
  eps: number;
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
}

export interface AnalyzeRequest {
  tickers: string[];
}

export interface AnalyzeResponse {
  results: WatchlistItem[];
  errors: { ticker: string; error: string }[];
}
