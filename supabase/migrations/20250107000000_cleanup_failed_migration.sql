-- Cleanup from failed migration attempt
-- Drop any partially created objects

-- Drop types if they exist (order matters due to dependencies)
DROP TYPE IF EXISTS skill_rating CASCADE;
DROP TYPE IF EXISTS stance_rating CASCADE;
DROP TYPE IF EXISTS nps_rating CASCADE;
DROP TYPE IF EXISTS work_shift CASCADE;
DROP TYPE IF EXISTS work_level CASCADE;
DROP TYPE IF EXISTS order_platform CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS job_scope CASCADE;

-- Drop tables if they exist
DROP TABLE IF EXISTS enum_labels CASCADE;
DROP TABLE IF EXISTS cost_orders CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS daily_cost_summary CASCADE;
DROP VIEW IF EXISTS monthly_cost_summary CASCADE;
DROP VIEW IF EXISTS budget_vs_actual CASCADE;
