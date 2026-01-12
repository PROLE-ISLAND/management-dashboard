-- =====================================================
-- 監査ログテーブル（IPO稟議ワークフロー - 改ざん不可）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- J-SOX対応: 監査証跡の完全性担保
-- =====================================================

-- 監査ログテーブル
CREATE TABLE IF NOT EXISTS approval.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval.requests(id),
    action VARCHAR(50) NOT NULL,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    actor_role VARCHAR(50) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    comment TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_approval_logs_request ON approval.logs(request_id);
CREATE INDEX idx_approval_logs_actor ON approval.logs(actor_id);
CREATE INDEX idx_approval_logs_created ON approval.logs(created_at);
CREATE INDEX idx_approval_logs_action ON approval.logs(action);

-- RLS有効化
ALTER TABLE approval.logs ENABLE ROW LEVEL SECURITY;

-- 監査担当・管理者のみ閲覧可能
CREATE POLICY "logs_viewable_by_auditor" ON approval.logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('auditor', 'admin')
        )
    );

-- 申請者・承認者は自分に関連するログを閲覧可能
CREATE POLICY "logs_viewable_by_involved" ON approval.logs
    FOR SELECT USING (
        actor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM approval.requests r
            WHERE r.id = request_id
            AND r.requester_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM approval.steps s
            WHERE s.request_id = approval.logs.request_id
            AND s.approver_id = auth.uid()
        )
    );

-- INSERT のみ許可（システム経由）
CREATE POLICY "logs_insert_only" ON approval.logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 改ざん防止機能
-- =====================================================

-- UPDATE禁止トリガー
CREATE OR REPLACE FUNCTION approval.prevent_log_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION '監査ログの更新は禁止されています（J-SOX対応）';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_approval_log_update
    BEFORE UPDATE ON approval.logs
    FOR EACH ROW
    EXECUTE FUNCTION approval.prevent_log_update();

-- DELETE禁止トリガー
CREATE OR REPLACE FUNCTION approval.prevent_log_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION '監査ログの削除は禁止されています（J-SOX対応）';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_approval_log_delete
    BEFORE DELETE ON approval.logs
    FOR EACH ROW
    EXECUTE FUNCTION approval.prevent_log_delete();

-- コメント
COMMENT ON TABLE approval.logs IS '監査ログ（改ざん不可、J-SOX対応）';
COMMENT ON COLUMN approval.logs.action IS '操作種別: submit/approve/reject/return/cancel';
COMMENT ON COLUMN approval.logs.actor_role IS '操作時点での役職';
COMMENT ON COLUMN approval.logs.metadata IS '追加情報（金額変更履歴など）';
