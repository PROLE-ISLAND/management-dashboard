-- Create budgets table for budget vs actual tracking
-- Budget granularity: monthly per category, with daily prorated values

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period: year-month format (e.g., "2025-01")
  year_month TEXT NOT NULL,

  -- Dimension for grouping (matches accounting table dimensions)
  dimension_type TEXT NOT NULL CHECK (dimension_type IN ('jobScope', 'jobLevel', 'orderCategory')),
  dimension_value TEXT NOT NULL,

  -- Monthly budget amount
  amount INTEGER NOT NULL DEFAULT 0,

  -- Optional: notes for this budget line
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one budget per month per dimension
  UNIQUE(year_month, dimension_type, dimension_value)
);

-- Index for efficient queries
CREATE INDEX idx_budgets_year_month ON budgets(year_month);
CREATE INDEX idx_budgets_dimension ON budgets(dimension_type, dimension_value);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budgets_updated_at();

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on budgets" ON budgets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE budgets IS 'Monthly budget amounts per dimension for budget vs actual tracking';
COMMENT ON COLUMN budgets.year_month IS 'Year and month in YYYY-MM format';
COMMENT ON COLUMN budgets.dimension_type IS 'Type of grouping: jobScope, jobLevel, or orderCategory';
COMMENT ON COLUMN budgets.dimension_value IS 'Value within the dimension (e.g., "デザイン")';
COMMENT ON COLUMN budgets.amount IS 'Monthly budget amount in yen';
