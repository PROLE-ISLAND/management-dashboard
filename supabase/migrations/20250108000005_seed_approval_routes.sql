-- =====================================================
-- 承認ルート初期データ（IPO稀議ワークフロー）
-- Issue: #6 feat(db): IPO稟議ワークフロー - DBスキーマ
-- =====================================================

-- 金額帯別承認ルート（標準設定）
INSERT INTO approval.routes (name, min_amount, max_amount, category) VALUES
    ('課長承認', 0, 100000, NULL),
    ('部長承認', 100001, 500000, NULL),
    ('役員承認', 500001, 1000000, NULL),
    ('取締役会承認', 1000001, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 特別ルート（契約専用）
INSERT INTO approval.routes (name, min_amount, max_amount, category) VALUES
    ('契約課長承認', 0, 300000, 'contract'),
    ('契約部長承認', 300001, 1000000, 'contract'),
    ('契約役員承認', 1000001, NULL, 'contract')
ON CONFLICT DO NOTHING;

-- =====================================================
-- user_rolesテーブル（未存在の場合のみ作成）
-- =====================================================

CREATE TABLE IF NOT EXISTS approval.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_role CHECK (role IN ('employee', 'manager', 'director', 'executive', 'auditor', 'admin')),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON approval.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON approval.user_roles(role);

-- RLS有効化
ALTER TABLE approval.user_roles ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが役職情報を閲覧可能（承認者選択のため）
CREATE POLICY "roles_viewable_by_authenticated" ON approval.user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 管理者のみ変更可能
CREATE POLICY "roles_modifiable_by_admin" ON approval.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approval.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- コメント
COMMENT ON TABLE approval.user_roles IS 'ユーザー役職（承認権限マトリックス用）';
COMMENT ON COLUMN approval.user_roles.role IS '役職: employee=一般, manager=課長, director=部長, executive=役員, auditor=監査担当, admin=管理者';
