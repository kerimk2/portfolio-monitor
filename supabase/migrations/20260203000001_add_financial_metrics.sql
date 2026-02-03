-- Add financial metrics columns to BDCs table

ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS dividend_yield DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS dividend_growth_3yr DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS nav_per_share DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS price DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS price_to_nav DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS non_accrual_pct DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS total_assets DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS debt_to_equity DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS net_investment_income_yield DECIMAL;
ALTER TABLE bdcs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add comments for documentation
COMMENT ON COLUMN bdcs.dividend_yield IS 'Current annual dividend yield as percentage';
COMMENT ON COLUMN bdcs.dividend_growth_3yr IS '3-year compound annual dividend growth rate';
COMMENT ON COLUMN bdcs.nav_per_share IS 'Net Asset Value per share';
COMMENT ON COLUMN bdcs.price IS 'Current stock price';
COMMENT ON COLUMN bdcs.price_to_nav IS 'Price to NAV ratio (premium/discount)';
COMMENT ON COLUMN bdcs.non_accrual_pct IS 'Non-accrual loans as percentage of portfolio at fair value';
COMMENT ON COLUMN bdcs.total_assets IS 'Total assets under management';
COMMENT ON COLUMN bdcs.debt_to_equity IS 'Debt to equity ratio';
COMMENT ON COLUMN bdcs.net_investment_income_yield IS 'Net investment income yield';
