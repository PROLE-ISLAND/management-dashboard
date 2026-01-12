-- =====================================================
-- 承認ルートテーブル（IPO稟議ワークフロー）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- =====================================================

-- approvalスキーマ作成
CREATE SCHEMA IF NOT EXISTS approval;

-- 承認ルート定義（金額帯別）
CREATE TABLE IF NOT EXISTS approval.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    max_amount DECIMAL(15, 2),
    category VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_amount_range CHECK (max_amount IS NULL OR min_amount <= max_amount)
);

-- インデックス
CREATE INDEX idx_approval_routes_amount ON approval.routes(min_amount, max_amount);
CREATE INDEX idx_approval_routes_category ON approval.routes(category) WHERE category IS NOT NULL;

-- RLS有効化
ALTER TABLE approval.routes ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能（ルート選択のため）
CREATE POLICY "routes_viewable_by_authenticated" ON approval.routes
    FOR SELECT USING (auth.role() = 'authenticated');

-- 管理者のみ変更可能
CREATE POLICY "routes_modifiable_by_admin" ON approval.routes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- コメント
COMMENT ON TABLE approval.routes IS '承認ルート定義（金額帯別）';
COMMENT ON COLUMN approval.routes.min_amount IS '最小金額（円）';
COMMENT ON COLUMN approval.routes.max_amount IS '最大金額（円）、NULLは上限なし';
COMMENT ON COLUMN approval.routes.category IS 'カテゴリ（契約、経費など）';
