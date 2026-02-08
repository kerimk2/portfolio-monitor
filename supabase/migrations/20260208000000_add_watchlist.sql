-- Watchlist: cache analyzed ticker data to save API calls
CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  company_name TEXT,
  description TEXT,
  sector TEXT,
  industry TEXT,
  market_cap DECIMAL,
  price DECIMAL,
  revenue DECIMAL,
  net_income DECIMAL,
  eps DECIMAL,
  pe_ratio DECIMAL,
  pb_ratio DECIMAL,
  ev_ebitda DECIMAL,
  roe DECIMAL,
  ytd_change DECIMAL,
  one_year_change DECIMAL,
  risks JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  evaluation TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watchlist_ticker ON watchlist_items(ticker);

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON watchlist_items FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON watchlist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON watchlist_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON watchlist_items FOR DELETE USING (true);
