-- =====================================================
-- 発注/依頼タスクDB (Notion同期用)
-- Notion DB ID: 44768ed1b8494c059f3080bd51f6968b
-- =====================================================

-- Use gen_random_uuid() which is built into PostgreSQL 13+
-- No extension needed

-- =====================================================
-- ENUM Types (Notionのselectオプションを再現)
-- =====================================================

-- 職務範囲
CREATE TYPE job_scope AS ENUM (
  'business',       -- ビジネス
  'marketing',      -- マーケティング
  'design',         -- デザイン
  'recruiting',     -- 採用
  'content'         -- コンテンツ
);

-- 発注/依頼媒体
CREATE TYPE order_platform AS ENUM (
  'timee',          -- タイミー
  'matchbox',       -- マッチボックス
  'crowdworks',     -- クラウドワークス
  'lancers',        -- ランサーズ
  'coconala'        -- ココナラ
);

-- 業務レベル
CREATE TYPE work_level AS ENUM (
  'direction',      -- Direction
  'hard',           -- Hard/企画推進
  'normal',         -- Normal/実務推進
  'easy'            -- Easy/定型
);

-- 発注ステータス
CREATE TYPE order_status AS ENUM (
  'not_started',
  'in_progress',
  'done'
);

-- NPS評価
CREATE TYPE nps_rating AS ENUM (
  'very_high',      -- 非常に高い(9~10)
  'high',           -- 高い(7~8)
  'normal',         -- 普通(4~6)
  'low'             -- 低い(0~3)
);

-- スキル評価 (1-5のレベル)
CREATE TYPE skill_rating AS ENUM (
  'level_5',        -- Lv.5：大幅に超え、オペレーション改善に寄与する
  'level_4',        -- Lv.4：期待以上に目標達成する
  'level_3',        -- Lv.3：会社の設定した目標を達成できる
  'level_2',        -- Lv.2：未達であるが、改善の兆しがある
  'level_1'         -- Lv.1：大幅に未達であり、改善の見込みもない
);

-- スタンス評価 (1-5のレベル)
CREATE TYPE stance_rating AS ENUM (
  'level_5',        -- Lv.5：さらに主体的な質疑応答や前向きな提案
  'level_4',        -- Lv.4：笑顔で挨拶ができ、業務指示に従う
  'level_3',        -- Lv.3：業務指示に従う
  'level_2',        -- Lv.2：改善指示を行うと渋々従う
  'level_1'         -- Lv.1：指示に従わない
);

-- 勤務時間(クール)
CREATE TYPE work_shift AS ENUM (
  'first_cool',     -- 第一クール
  'second_cool',    -- 第二クール
  'third_cool',     -- 第三クール
  'fulltime',       -- フルタイム
  'flexible',       -- フレキシブル
  'new',            -- 新規
  'existing',       -- 既存
  'selection'       -- 選考
);

-- =====================================================
-- Lookup Table: ENUM値と日本語ラベルの対応表
-- =====================================================

CREATE TABLE enum_labels (
  id SERIAL PRIMARY KEY,
  enum_type TEXT NOT NULL,
  enum_value TEXT NOT NULL,
  label_ja TEXT NOT NULL,
  label_en TEXT,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(enum_type, enum_value)
);

-- 職務範囲ラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('job_scope', 'business', 'ビジネス', 'Business', 1),
('job_scope', 'marketing', 'マーケティング', 'Marketing', 2),
('job_scope', 'design', 'デザイン', 'Design', 3),
('job_scope', 'recruiting', '採用', 'Recruiting', 4),
('job_scope', 'content', 'コンテンツ', 'Content', 5);

-- スキル評価ラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('skill_rating', 'level_5', 'Lv.5：大幅に超え、オペレーション改善に寄与する', 'Level 5: Exceeds expectations significantly', 1),
('skill_rating', 'level_4', 'Lv.4：期待以上に目標達成する', 'Level 4: Exceeds goals', 2),
('skill_rating', 'level_3', 'Lv.3：会社の設定した目標を達成できる', 'Level 3: Meets goals', 3),
('skill_rating', 'level_2', 'Lv.2：未達であるが、改善の兆しがある', 'Level 2: Below but improving', 4),
('skill_rating', 'level_1', 'Lv.1：大幅に未達であり、改善の見込みもない', 'Level 1: Significantly below', 5);

-- スタンス評価ラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('stance_rating', 'level_5', 'Lv.5：さらに主体的な質疑応答や前向きな提案', 'Level 5: Proactive', 1),
('stance_rating', 'level_4', 'Lv.4：笑顔で挨拶ができ、業務指示に従う', 'Level 4: Positive', 2),
('stance_rating', 'level_3', 'Lv.3：業務指示に従う', 'Level 3: Follows instructions', 3),
('stance_rating', 'level_2', 'Lv.2：改善指示を行うと渋々従う', 'Level 2: Reluctant', 4),
('stance_rating', 'level_1', 'Lv.1：指示に従わない', 'Level 1: Non-compliant', 5);

-- 発注/依頼媒体ラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('order_platform', 'timee', 'タイミー', 'Timee', 1),
('order_platform', 'matchbox', 'マッチボックス', 'Matchbox', 2),
('order_platform', 'crowdworks', 'クラウドワークス', 'CrowdWorks', 3),
('order_platform', 'lancers', 'ランサーズ', 'Lancers', 4),
('order_platform', 'coconala', 'ココナラ', 'Coconala', 5);

-- 業務レベルラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('work_level', 'direction', 'Direction', 'Direction', 1),
('work_level', 'hard', 'Hard/企画推進', 'Hard', 2),
('work_level', 'normal', 'Normal/実務推進', 'Normal', 3),
('work_level', 'easy', 'Easy/定型', 'Easy', 4);

-- NPSラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('nps_rating', 'very_high', '非常に高い(9~10)', 'Very High (9-10)', 1),
('nps_rating', 'high', '高い(7~8)', 'High (7-8)', 2),
('nps_rating', 'normal', '普通(4~6)', 'Normal (4-6)', 3),
('nps_rating', 'low', '低い(0~3)', 'Low (0-3)', 4);

-- 勤務時間ラベル
INSERT INTO enum_labels (enum_type, enum_value, label_ja, label_en, sort_order) VALUES
('work_shift', 'first_cool', '第一クール', 'First Cool', 1),
('work_shift', 'second_cool', '第二クール', 'Second Cool', 2),
('work_shift', 'third_cool', '第三クール', 'Third Cool', 3),
('work_shift', 'fulltime', 'フルタイム', 'Full Time', 4),
('work_shift', 'flexible', 'フレキシブル', 'Flexible', 5),
('work_shift', 'new', '新規', 'New', 6),
('work_shift', 'existing', '既存', 'Existing', 7),
('work_shift', 'selection', '選考', 'Selection', 8);

-- =====================================================
-- Main Table: cost_orders (発注/依頼タスク)
-- =====================================================

CREATE TABLE cost_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_id TEXT UNIQUE NOT NULL,  -- Notion page ID

  -- 基本情報
  order_name TEXT NOT NULL,  -- 発注決裁名 (title)
  order_categories TEXT[],   -- 発注科目/依頼業務 (multi_select)
  job_scope job_scope,       -- 職務範囲
  work_level work_level,     -- 業務レベル

  -- 金額関連
  hourly_rate DECIMAL(10,2),     -- 時給/数量単価
  quantity DECIMAL(10,2),        -- 時間/数量
  total_amount DECIMAL(12,2),    -- 総支給額 (計算フィールド)

  -- 日付
  application_date DATE,    -- 申請日
  deadline_date DATE,       -- 納期/シフト

  -- 発注先情報
  order_platform order_platform,  -- 発注/依頼媒体
  order_status order_status DEFAULT 'not_started',

  -- 担当者情報
  applicant TEXT,          -- 起案者
  approver TEXT,           -- 決裁者
  assignee TEXT,           -- 担当者
  mb_assignee TEXT,        -- MB担当者名
  assignee_url TEXT,       -- 発注先担当者URL

  -- 評価
  skill_rating skill_rating,
  stance_rating stance_rating,
  nps_rating nps_rating,
  work_shift work_shift,

  -- その他
  order_reason TEXT,       -- 発注採択理由
  deduction_notes TEXT,    -- 減点・懸念事項
  client_name TEXT,        -- CL (クライアント名)

  -- Notion同期メタ
  notion_created_at TIMESTAMPTZ,
  notion_updated_at TIMESTAMPTZ,

  -- システムメタ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Budget Table: budgets (予算管理 - 新規追加)
-- =====================================================

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 予算の粒度
  fiscal_year INTEGER NOT NULL,        -- 年度
  fiscal_month INTEGER NOT NULL,       -- 月 (1-12)
  job_scope job_scope,                 -- 職務範囲別
  order_category TEXT,                 -- 発注科目別 (nullable = 全体)

  -- 金額
  budget_amount DECIMAL(12,2) NOT NULL,  -- 予算額

  -- メタ
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ユニーク制約: 年月×職務範囲×科目 で一意
  UNIQUE(fiscal_year, fiscal_month, job_scope, order_category)
);

-- =====================================================
-- Aggregation Views (日次→週次→月次集計)
-- =====================================================

-- 日次集計ビュー
CREATE VIEW daily_cost_summary AS
SELECT
  application_date AS date,
  job_scope,
  UNNEST(order_categories) AS order_category,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_cost
FROM cost_orders
WHERE application_date IS NOT NULL
GROUP BY application_date, job_scope, UNNEST(order_categories);

-- 月次集計ビュー (予算比較用)
CREATE VIEW monthly_cost_summary AS
SELECT
  EXTRACT(YEAR FROM application_date)::INTEGER AS fiscal_year,
  EXTRACT(MONTH FROM application_date)::INTEGER AS fiscal_month,
  job_scope,
  UNNEST(order_categories) AS order_category,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_cost
FROM cost_orders
WHERE application_date IS NOT NULL
GROUP BY
  EXTRACT(YEAR FROM application_date),
  EXTRACT(MONTH FROM application_date),
  job_scope,
  UNNEST(order_categories);

-- 予算vs実績ビュー
CREATE VIEW budget_vs_actual AS
SELECT
  b.fiscal_year,
  b.fiscal_month,
  b.job_scope,
  b.order_category,
  b.budget_amount,
  COALESCE(m.total_cost, 0) AS actual_cost,
  b.budget_amount - COALESCE(m.total_cost, 0) AS variance,
  CASE
    WHEN b.budget_amount > 0
    THEN ROUND((COALESCE(m.total_cost, 0) / b.budget_amount * 100)::NUMERIC, 2)
    ELSE 0
  END AS achievement_rate
FROM budgets b
LEFT JOIN monthly_cost_summary m ON
  b.fiscal_year = m.fiscal_year AND
  b.fiscal_month = m.fiscal_month AND
  b.job_scope = m.job_scope AND
  (b.order_category = m.order_category OR b.order_category IS NULL);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_cost_orders_notion_id ON cost_orders(notion_id);
CREATE INDEX idx_cost_orders_application_date ON cost_orders(application_date);
CREATE INDEX idx_cost_orders_job_scope ON cost_orders(job_scope);
CREATE INDEX idx_cost_orders_status ON cost_orders(order_status);
CREATE INDEX idx_budgets_period ON budgets(fiscal_year, fiscal_month);
CREATE INDEX idx_enum_labels_type ON enum_labels(enum_type);

-- =====================================================
-- Triggers: auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cost_orders_updated_at
  BEFORE UPDATE ON cost_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS Policies (Row Level Security)
-- =====================================================

ALTER TABLE cost_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE enum_labels ENABLE ROW LEVEL SECURITY;

-- 認証ユーザーは全データ読み取り可能
CREATE POLICY "Allow authenticated read" ON cost_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON budgets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON enum_labels
  FOR SELECT TO authenticated USING (true);

-- Service roleは全操作可能 (Notion同期用)
CREATE POLICY "Allow service role all" ON cost_orders
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role all" ON budgets
  FOR ALL TO service_role USING (true);

-- enum_labelsは読み取り専用（管理者のみ編集）
CREATE POLICY "Allow anon read enum_labels" ON enum_labels
  FOR SELECT TO anon USING (true);
