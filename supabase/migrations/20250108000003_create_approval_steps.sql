-- =====================================================
-- 承認ステップテーブル（IPO稟議ワークフロー）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- =====================================================

-- 承認ステップテーブル
CREATE TABLE IF NOT EXISTS approval.steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval.requests(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    approver_role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    comment TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_step_status CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    CONSTRAINT unique_request_step UNIQUE (request_id, step_order)
);

-- インデックス
CREATE INDEX idx_approval_steps_request ON approval.steps(request_id);
CREATE INDEX idx_approval_steps_approver ON approval.steps(approver_id);
CREATE INDEX idx_approval_steps_status ON approval.steps(status);

-- RLS有効化
ALTER TABLE approval.steps ENABLE ROW LEVEL SECURITY;

-- 申請者: 自分の申請のステップを閲覧
CREATE POLICY "steps_viewable_by_requester" ON approval.steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.requests r
            WHERE r.id = request_id
            AND r.requester_id = auth.uid()
        )
    );

-- 承認者: 自分が承認者のステップを閲覧・更新
CREATE POLICY "steps_viewable_by_approver" ON approval.steps
    FOR SELECT USING (approver_id = auth.uid());

CREATE POLICY "steps_updatable_by_approver" ON approval.steps
    FOR UPDATE USING (
        approver_id = auth.uid()
        AND status = 'pending'
    );

-- 監査担当・管理者: 全件閲覧
CREATE POLICY "steps_viewable_by_auditor" ON approval.steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('auditor', 'admin')
        )
    );

-- システム: ステップ作成可能
CREATE POLICY "steps_insertable_by_system" ON approval.steps
    FOR INSERT WITH CHECK (true);

-- 管理者: 全操作可能
CREATE POLICY "steps_all_by_admin" ON approval.steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- コメント
COMMENT ON TABLE approval.steps IS '承認ステップ';
COMMENT ON COLUMN approval.steps.step_order IS '承認順序（1から開始）';
COMMENT ON COLUMN approval.steps.approver_role IS '承認時点での役職';
COMMENT ON COLUMN approval.steps.status IS 'ステータス: pending=待機, approved=承認, rejected=却下, skipped=スキップ';
