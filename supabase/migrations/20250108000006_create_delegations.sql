-- =====================================================
-- 代理承認テーブル（IPO稟議ワークフロー）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- 目的: 役員不在時の代理承認権限管理
-- =====================================================

-- 代理承認テーブル
CREATE TABLE IF NOT EXISTS approval.delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id UUID NOT NULL REFERENCES auth.users(id),    -- 委任者（本来の承認者）
    delegate_id UUID NOT NULL REFERENCES auth.users(id),     -- 代理者
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_amount NUMERIC(15, 2),                               -- 代理承認上限金額（NULL=無制限）
    categories TEXT[],                                       -- 対象カテゴリ（NULL=全て）
    reason TEXT NOT NULL,                                    -- 代理理由（出張、休暇等）
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_date_range CHECK (start_date <= end_date),
    CONSTRAINT different_users CHECK (delegator_id != delegate_id),
    CONSTRAINT valid_max_amount CHECK (max_amount IS NULL OR max_amount > 0)
);

-- インデックス
CREATE INDEX idx_delegations_delegator ON approval.delegations(delegator_id);
CREATE INDEX idx_delegations_delegate ON approval.delegations(delegate_id);
CREATE INDEX idx_delegations_active ON approval.delegations(is_active, start_date, end_date);
CREATE INDEX idx_delegations_date_range ON approval.delegations(start_date, end_date);

-- RLS有効化
ALTER TABLE approval.delegations ENABLE ROW LEVEL SECURITY;

-- 委任者: 自分の代理設定を閲覧・管理
CREATE POLICY "delegations_manageable_by_delegator" ON approval.delegations
    FOR ALL USING (delegator_id = auth.uid());

-- 代理者: 自分への代理設定を閲覧
CREATE POLICY "delegations_viewable_by_delegate" ON approval.delegations
    FOR SELECT USING (delegate_id = auth.uid());

-- 監査担当・管理者: 全件閲覧
CREATE POLICY "delegations_viewable_by_auditor" ON approval.delegations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('auditor', 'admin')
        )
    );

-- 管理者: 全操作可能
CREATE POLICY "delegations_all_by_admin" ON approval.delegations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- 有効な代理設定を取得するビュー
CREATE OR REPLACE VIEW approval.active_delegations AS
SELECT
    d.*,
    delegator.email AS delegator_email,
    delegate.email AS delegate_email
FROM approval.delegations d
JOIN auth.users delegator ON d.delegator_id = delegator.id
JOIN auth.users delegate ON d.delegate_id = delegate.id
WHERE d.is_active = true
  AND CURRENT_DATE BETWEEN d.start_date AND d.end_date;

-- コメント
COMMENT ON TABLE approval.delegations IS '代理承認設定（役員不在時の権限委任）';
COMMENT ON COLUMN approval.delegations.delegator_id IS '委任者（本来の承認者）';
COMMENT ON COLUMN approval.delegations.delegate_id IS '代理者（承認を代行する者）';
COMMENT ON COLUMN approval.delegations.max_amount IS '代理承認の上限金額（NULL=無制限）';
COMMENT ON COLUMN approval.delegations.categories IS '対象カテゴリ（NULL=全カテゴリ）';
COMMENT ON COLUMN approval.delegations.reason IS '代理理由（出張、休暇、病欠等）';
COMMENT ON VIEW approval.active_delegations IS '現在有効な代理設定一覧';
