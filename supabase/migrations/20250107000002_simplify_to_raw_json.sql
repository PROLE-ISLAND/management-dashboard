-- =====================================================
-- Notion生データをそのまま保存する方式に変更
-- =====================================================

-- 旧テーブル・ビュー削除
DROP VIEW IF EXISTS budget_vs_actual CASCADE;
DROP VIEW IF EXISTS monthly_cost_summary CASCADE;
DROP VIEW IF EXISTS daily_cost_summary CASCADE;
DROP TABLE IF EXISTS cost_orders CASCADE;

-- =====================================================
-- 新テーブル: notion_orders (Notion生データ保存)
-- =====================================================

CREATE TABLE notion_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_id TEXT UNIQUE NOT NULL,  -- Notion page ID

  -- Notion生データ（JSON形式そのまま）
  properties JSONB NOT NULL,       -- Notionのproperties全体

  -- Notion メタデータ
  notion_created_at TIMESTAMPTZ,
  notion_updated_at TIMESTAMPTZ,

  -- システムメタ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 便利なビュー: 日本語カラム名でアクセス
-- =====================================================

CREATE VIEW notion_orders_view AS
SELECT
  id,
  notion_id,

  -- 基本情報
  properties->>'発注決裁名' AS 発注決裁名,
  properties->'発注科目/依頼業務' AS 発注科目,
  properties->>'職務範囲' AS 職務範囲,
  properties->>'業務レベル' AS 業務レベル,

  -- 金額
  (properties->>'時給/数量単価')::DECIMAL AS 時給単価,
  (properties->>'時間/数量')::DECIMAL AS 時間数量,
  (properties->>'総支給額')::DECIMAL AS 総支給額,

  -- 日付
  (properties->>'申請日')::DATE AS 申請日,
  (properties->>'納期/シフト')::DATE AS 納期,

  -- 発注先
  properties->>'発注/依頼媒体' AS 発注媒体,
  properties->>'発注ステータス' AS ステータス,

  -- 担当者
  properties->>'起案者' AS 起案者,
  properties->>'決裁者' AS 決裁者,
  properties->>'担当者' AS 担当者,
  properties->>'MB担当者名' AS MB担当者,

  -- 評価
  properties->>'スキル評価' AS スキル評価,
  properties->>'スタンス評価' AS スタンス評価,
  properties->>'NPS' AS NPS,

  -- その他
  properties->>'CL' AS クライアント,

  -- メタ
  notion_created_at,
  notion_updated_at,
  synced_at

FROM notion_orders;

-- =====================================================
-- 集計ビュー（日本語カラムで）
-- =====================================================

-- 月次集計
CREATE VIEW 月次コスト集計 AS
SELECT
  EXTRACT(YEAR FROM (properties->>'申請日')::DATE)::INTEGER AS 年,
  EXTRACT(MONTH FROM (properties->>'申請日')::DATE)::INTEGER AS 月,
  properties->>'職務範囲' AS 職務範囲,
  COUNT(*) AS 件数,
  SUM((properties->>'総支給額')::DECIMAL) AS 総額
FROM notion_orders
WHERE properties->>'申請日' IS NOT NULL
GROUP BY 1, 2, 3;

-- =====================================================
-- budgetsテーブルも日本語化
-- =====================================================

DROP TABLE IF EXISTS budgets CASCADE;

CREATE TABLE 予算 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  年度 INTEGER NOT NULL,
  月 INTEGER NOT NULL,
  職務範囲 TEXT,
  発注科目 TEXT,
  予算額 DECIMAL(12,2) NOT NULL,
  備考 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(年度, 月, 職務範囲, 発注科目)
);

-- 予算vs実績ビュー
CREATE VIEW 予算実績比較 AS
SELECT
  b.年度,
  b.月,
  b.職務範囲,
  b.発注科目,
  b.予算額,
  COALESCE(m.総額, 0) AS 実績額,
  b.予算額 - COALESCE(m.総額, 0) AS 差異,
  CASE
    WHEN b.予算額 > 0
    THEN ROUND((COALESCE(m.総額, 0) / b.予算額 * 100)::NUMERIC, 2)
    ELSE 0
  END AS 達成率
FROM 予算 b
LEFT JOIN 月次コスト集計 m ON
  b.年度 = m.年 AND
  b.月 = m.月 AND
  (b.職務範囲 = m.職務範囲 OR b.職務範囲 IS NULL);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_notion_orders_notion_id ON notion_orders(notion_id);
CREATE INDEX idx_notion_orders_properties ON notion_orders USING GIN (properties);
CREATE INDEX idx_notion_orders_synced_at ON notion_orders(synced_at);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE notion_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE 予算 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON notion_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role all" ON notion_orders
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow authenticated read" ON 予算
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role all" ON 予算
  FOR ALL TO service_role USING (true);

-- Anon read for views
CREATE POLICY "Allow anon read" ON notion_orders
  FOR SELECT TO anon USING (true);
