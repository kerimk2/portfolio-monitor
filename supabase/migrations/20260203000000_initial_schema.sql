-- BDC Portfolio Screener Database Schema

-- Table: List of BDCs we track
CREATE TABLE bdcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cik TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  ticker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Portfolio holdings from Schedule of Investments
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bdc_cik TEXT NOT NULL,
  period_date DATE NOT NULL,
  company_name TEXT NOT NULL,
  industry_raw TEXT,
  industry_sector TEXT,
  fair_value DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Sector mapping overrides for edge cases
CREATE TABLE sector_mappings (
  raw_industry TEXT PRIMARY KEY,
  standardized_sector TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_holdings_bdc_cik ON holdings(bdc_cik);
CREATE INDEX idx_holdings_period_date ON holdings(period_date DESC);
CREATE INDEX idx_holdings_sector ON holdings(industry_sector);

-- Enable Row Level Security (but allow public read for now)
ALTER TABLE bdcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_mappings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON bdcs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON holdings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON sector_mappings FOR SELECT USING (true);

-- Allow authenticated insert/update for data import
CREATE POLICY "Allow authenticated insert" ON bdcs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON holdings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON bdcs FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated update" ON holdings FOR UPDATE USING (true);
