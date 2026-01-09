-- =====================================================
-- 添付ファイルテーブル（IPO稟議ワークフロー）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- 目的: 稟議申請への複数ファイル添付
-- =====================================================

-- 添付ファイルテーブル
CREATE TABLE IF NOT EXISTS approval.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval.requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,                                  -- Supabase Storage パス
    file_size INTEGER NOT NULL,                               -- バイト
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800),  -- 50MB上限
    CONSTRAINT valid_mime_type CHECK (
        mime_type IN (
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/png',
            'image/jpeg',
            'image/gif',
            'text/plain',
            'text/csv'
        )
    )
);

-- インデックス
CREATE INDEX idx_attachments_request ON approval.attachments(request_id);
CREATE INDEX idx_attachments_uploaded_by ON approval.attachments(uploaded_by);

-- RLS有効化
ALTER TABLE approval.attachments ENABLE ROW LEVEL SECURITY;

-- 申請者: 自分の申請の添付ファイルを管理
CREATE POLICY "attachments_manageable_by_requester" ON approval.attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approval.requests r
            WHERE r.id = request_id
            AND r.requester_id = auth.uid()
        )
    );

-- 承認者: 自分が承認者の申請の添付ファイルを閲覧
CREATE POLICY "attachments_viewable_by_approver" ON approval.attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.steps s
            WHERE s.request_id = approval.attachments.request_id
            AND s.approver_id = auth.uid()
        )
    );

-- 監査担当・管理者: 全件閲覧
CREATE POLICY "attachments_viewable_by_auditor" ON approval.attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('auditor', 'admin')
        )
    );

-- システム: 添付ファイル作成可能
CREATE POLICY "attachments_insertable_by_authenticated" ON approval.attachments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- コメント
COMMENT ON TABLE approval.attachments IS '稟議申請添付ファイル';
COMMENT ON COLUMN approval.attachments.file_path IS 'Supabase Storage内のファイルパス';
COMMENT ON COLUMN approval.attachments.file_size IS 'ファイルサイズ（バイト、上限50MB）';
COMMENT ON COLUMN approval.attachments.mime_type IS '許可されたMIMEタイプのみ';
