-- =====================================================
-- 稟議申請テーブル（IPO稟議ワークフロー）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- =====================================================

-- 稟議申請テーブル
CREATE TABLE IF NOT EXISTS approval.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(50),
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    route_id UUID NOT NULL REFERENCES approval.routes(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled')),
    CONSTRAINT valid_amount CHECK (amount >= 0)
);

-- インデックス
CREATE INDEX idx_approval_requests_requester ON approval.requests(requester_id);
CREATE INDEX idx_approval_requests_status ON approval.requests(status);
CREATE INDEX idx_approval_requests_route ON approval.requests(route_id);
CREATE INDEX idx_approval_requests_submitted ON approval.requests(submitted_at) WHERE submitted_at IS NOT NULL;

-- RLS有効化
ALTER TABLE approval.requests ENABLE ROW LEVEL SECURITY;

-- 申請者: 自分の申請のみ閲覧
CREATE POLICY "requests_viewable_by_requester" ON approval.requests
    FOR SELECT USING (requester_id = auth.uid());

-- 申請者: 下書きのみ編集可能
CREATE POLICY "requests_editable_by_requester" ON approval.requests
    FOR UPDATE USING (
        requester_id = auth.uid()
        AND status = 'draft'
    );

-- 申請者: 新規作成可能
CREATE POLICY "requests_insertable_by_authenticated" ON approval.requests
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        AND requester_id = auth.uid()
    );

-- 承認者: 承認待ちの申請を閲覧
CREATE POLICY "requests_viewable_by_approver" ON approval.requests
    FOR SELECT USING (
        status = 'pending'
        AND EXISTS (
            SELECT 1 FROM approval.steps s
            WHERE s.request_id = id
            AND s.approver_id = auth.uid()
            AND s.status = 'pending'
        )
    );

-- 監査担当・管理者: 全件閲覧
CREATE POLICY "requests_viewable_by_auditor" ON approval.requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('auditor', 'admin')
        )
    );

-- 管理者: 全操作可能
CREATE POLICY "requests_all_by_admin" ON approval.requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- コメント
COMMENT ON TABLE approval.requests IS '稟議申請';
COMMENT ON COLUMN approval.requests.status IS 'ステータス: draft=下書き, pending=承認中, approved=承認済, rejected=却下, cancelled=取消';
COMMENT ON COLUMN approval.requests.amount IS '申請金額（円）';
