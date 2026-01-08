# REQ-6: IPO稟議ワークフロー - DBスキーマ設計

## 0. 分割戦略コンテキスト

| 項目 | 内容 |
|------|------|
| **親Issue** | #5 [Feature]: IPO稟議ワークフローシステム |
| **分割戦略** | レイヤー別（DB→API→UI） |
| **Phase** | 1/3 |
| **担当レイヤー** | DB |
| **前Phase依存** | なし（最初のPhase） |
| **後Phase** | #7 feat(api): IPO稟議ワークフロー - API |

### スコープ制限

このPRでは **DBスキーマ設計** のみを対象とする。

- Phase 4.1 DB設計: ✅ 対象
- Phase 4.2 API設計: ❌ 対象外（#7で実施）
- Phase 4.3 UI設計: ❌ 対象外（#8で実施）

---

## 1. 調査レポート

**調査レポートリンク**: 親Issue #5 参照（会話内調査）

### Investigation Report v1 要約

| 項目 | 内容 |
|------|------|
| 既存システム名 | management-dashboard（経営ダッシュボード） |
| エントリーポイント | UI: Reflex/Next.js / API: Supabase RPC / CLI: なし |
| 主要データモデル | cost_orders, raw_notion_data |
| キーファイル | supabase/migrations/, next-app/src/lib/supabase/ |
| 拡張ポイント | 新規テーブル追加、RLSポリシー追加 |
| 破壊ポイント | 既存auth.usersとの整合性、RLS競合 |
| やりたいこと | J-SOX対応の稟議ワークフロー用DBスキーマを構築 |

---

## 2. Phase 2: 要件定義・ユースケース

### 2.1 機能概要

| 項目 | 内容 |
|------|------|
| **なぜ必要か（Why）** | 上場審査（IPO）基準を満たす内部統制、監査証跡の永続化 |
| **誰が使うか（Who）** | 申請者、承認者（課長/部長/役員）、監査担当 |
| **何を達成するか（What）** | 稟議データ、承認ルート、承認ステップ、監査ログの永続化 |

### 2.2 ユースケース定義（Role × Outcome）

> DB層はAPIからのCRUD操作を受け付けるため、間接的に以下のUCを支援

| UC-ID | Role | Outcome | Channel | DB責務 |
|-------|------|---------|---------|--------|
| UC-APPROVAL-REQUESTER-SUBMIT-WEB | 申請者 | 稟議を申請 | WEB | approval_requests INSERT |
| UC-APPROVAL-MANAGER-APPROVE-WEB | 課長 | 稟議を承認 | WEB | approval_steps UPDATE, approval_logs INSERT |
| UC-APPROVAL-DIRECTOR-APPROVE-WEB | 部長 | 高額稟議を承認 | WEB | approval_steps UPDATE, approval_logs INSERT |
| UC-APPROVAL-EXECUTIVE-APPROVE-WEB | 役員 | 最終承認 | WEB | approval_steps UPDATE, approval_logs INSERT |
| UC-APPROVAL-AUDITOR-AUDIT-WEB | 監査担当 | 承認履歴を監査 | WEB | approval_logs SELECT |

### 2.3 Role × Value マトリクス

| Role | 提供する価値 | 受け取る価値 | 関連Outcome |
|------|-------------|-------------|-------------|
| 申請者 | 稟議データ | 承認ステータス | 申請、確認 |
| 承認者 | 承認判断 | 承認対象情報 | 承認、却下、差戻し |
| 監査担当 | — | 監査証跡 | 監査 |
| System | CRUD操作 | — | 全操作 |

### 2.4 カバレッジマトリクス（MECE証明）

| Role＼操作 | CREATE | READ | UPDATE | DELETE |
|-----------|:------:|:----:|:------:|:------:|
| 申請者 | ✅ 自分の申請 | ✅ 自分の申請 | ✅ 下書きのみ | — 禁止 |
| 承認者 | — | ✅ 承認待ち | ✅ 自分のステップ | — 禁止 |
| 監査担当 | — | ✅ 全件 | — 禁止 | — 禁止 |
| Admin | ✅ 全操作 | ✅ 全件 | ✅ 全操作 | — 監査ログ以外 |

### 2.5 入力ソースチェックリスト

| 入力ソース | 確認状態 | 抽出UC数 | 備考 |
|-----------|---------|---------|------|
| 親Issue #5 | ✅ | 5 | ユースケース定義済み |
| 競合サービス調査 | ✅ | - | freee/MF/ジョブカン参考 |
| J-SOX要件 | ✅ | - | 監査証跡・職務分離 |
| 既存DBスキーマ | ✅ | - | cost_orders参照 |

### 2.6 外部整合性チェック

- [x] 親Issue #5 のUC定義と整合
- [x] 既存auth.usersテーブルとの外部キー整合
- [x] J-SOX要件（改ざん不可ログ）を満たす設計

---

## 3. Phase 3: 品質基準

### 3.1 DoD Level 選択

- [ ] Bronze (27観点: 80%カバレッジ)
- [x] Silver (31観点: 85%カバレッジ)
- [ ] Gold (19観点: 95%カバレッジ)

**選定理由**: 親Issue #5 で Silver 指定。DBスキーマはAPIテストでカバー。

### 3.2 Pre-mortem（失敗シナリオ）

| # | 失敗シナリオ | 発生確率 | 対策 | 確認方法 |
|---|-------------|---------|------|---------|
| 1 | RLSポリシーが既存ポリシーと競合 | 中 | 既存ポリシー確認、新規テーブルのみ適用 | マイグレーション後のテスト |
| 2 | auth.usersへの外部キー制約失敗 | 低 | CASCADE設定、NOT NULL確認 | マイグレーション適用確認 |
| 3 | 監査ログのUPDATE/DELETE禁止が効かない | 中 | トリガーで明示的にブロック | 手動テスト |
| 4 | user_rolesテーブル未存在でRLS失敗 | 高 | シードで同時作成 | マイグレーション順序確認 |

---

## 4. Phase 4: 技術設計

### 4.1 データベース設計

**新規テーブル:**

| テーブル名 | 用途 | RLSポリシー |
|-----------|------|------------|
| approval_routes | 承認ルート定義（金額帯別） | 認証ユーザー閲覧可 |
| approval_requests | 稟議申請 | 申請者/承認者/監査担当別 |
| approval_steps | 承認ステップ | 関係者のみ閲覧 |
| approval_logs | 監査ログ（改ざん不可） | 監査担当/管理者のみ |
| user_roles | ユーザー役職 | 認証ユーザー閲覧可 |

#### CRUD操作マトリクス

| テーブル | Create | Read | Update | Delete | 担当API |
|---------|:------:|:----:|:------:|:------:|---------|
| approval_routes | ✅ | ✅ | ✅ | ✅ | 管理画面（将来） |
| approval_requests | ✅ | ✅ | ✅ | ❌ | POST/GET/PATCH /api/approvals |
| approval_steps | ✅ | ✅ | ✅ | ❌ | POST /api/approvals/:id/approve等 |
| approval_logs | ✅ | ✅ | ❌ | ❌ | GET /api/audit-logs |
| user_roles | ✅ | ✅ | ✅ | ✅ | 管理画面（将来） |

#### RLSテスト観点

| ポリシー名 | 対象操作 | 許可条件 | テストケース |
|-----------|---------|---------|-------------|
| requester_view_own | SELECT | requester_id = auth.uid() | 自分の申請のみ表示 |
| approver_view_pending | SELECT | 承認待ちステップの承認者 | 承認対象のみ表示 |
| auditor_view_all | SELECT | role = 'auditor' | 全件表示 |
| logs_insert_only | INSERT | true | 追加のみ可能 |
| prevent_log_update | UPDATE | false（トリガー） | 更新不可確認 |
| prevent_log_delete | DELETE | false（トリガー） | 削除不可確認 |

#### テーブル詳細設計

**approval_routes**
```sql
CREATE TABLE approval_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    max_amount DECIMAL(15, 2),
    category VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**approval_requests**
```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    current_step INT NOT NULL DEFAULT 0,
    route_id UUID REFERENCES approval_routes(id),
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'returned')),
    CONSTRAINT valid_category CHECK (category IN ('expense', 'purchase', 'contract', 'other'))
);
```

**approval_steps**
```sql
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES approval_routes(id),
    step_order INT NOT NULL,
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    approver_role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    comment TEXT,
    acted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_step_status CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'skipped')),
    CONSTRAINT unique_step UNIQUE (request_id, step_order)
);
```

**approval_logs（改ざん不可）**
```sql
CREATE TABLE approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval_requests(id),
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

-- UPDATE/DELETE禁止トリガー
CREATE TRIGGER prevent_update BEFORE UPDATE ON approval_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_approval_log_update();
CREATE TRIGGER prevent_delete BEFORE DELETE ON approval_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_approval_log_delete();
```

**user_roles**
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_role CHECK (role IN ('employee', 'manager', 'director', 'executive', 'auditor', 'admin')),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);
```

### 4.2 API設計

❌ 対象外（#7で実施）

### 4.3 UI設計

❌ 対象外（#8で実施）

### 4.4 変更ファイル一覧

| ファイルパス | 変更種別 | 概要 |
|-------------|---------|------|
| `supabase/migrations/20250108000001_create_approval_routes.sql` | 新規 | 承認ルートテーブル |
| `supabase/migrations/20250108000002_create_approval_requests.sql` | 新規 | 稟議申請テーブル |
| `supabase/migrations/20250108000003_create_approval_steps.sql` | 新規 | 承認ステップテーブル |
| `supabase/migrations/20250108000004_create_approval_logs.sql` | 新規 | 監査ログテーブル（改ざん不可） |
| `supabase/migrations/20250108000005_seed_approval_routes.sql` | 新規 | 初期データ・user_rolesテーブル |

---

## 5. Phase 5: テスト設計

### 5.1 Gold E2E候補評価

> DBスキーマ単体はGold E2E対象外（API/UI経由でテスト）

| レンズ | 質問 | 回答 |
|--------|------|------|
| 行動フォーカス | 実装ではなくユーザー目標を検証しているか？ | いいえ（インフラ層） |
| 欺瞞耐性 | モック/スタブでは通過できないか？ | いいえ |
| 明確な失敗説明 | 失敗理由を1文で説明できるか？ | — |
| リスク明示 | このテストがないと何を犠牲にするか説明できるか？ | — |

**結論**: Gold E2E対象外（統合テストでカバー）

### 5.2 単体テスト設計

| 対象 | テストケース | 期待結果 |
|------|------------|---------|
| マイグレーション | 全ファイル適用 | エラーなく完了 |
| 制約チェック | 不正statusでINSERT | CHECK制約エラー |
| 制約チェック | 不正categoryでINSERT | CHECK制約エラー |
| 外部キー | 存在しないユーザーID | 外部キー制約エラー |

### 5.3 統合テスト設計

#### 5.3.1 DB統合テスト

| テスト対象 | テスト内容 | 前提条件 | 期待結果 |
|-----------|-----------|---------|---------|
| RLS: requester_view_own | 他ユーザーの申請取得 | 異なるユーザーで認証 | 空結果 |
| RLS: approver_view_pending | 承認対象の申請取得 | 承認者で認証 | 該当申請のみ |
| RLS: auditor_view_all | 全申請取得 | 監査担当で認証 | 全件取得 |
| 改ざん防止: UPDATE | approval_logsをUPDATE | 任意ユーザー | 例外発生 |
| 改ざん防止: DELETE | approval_logsをDELETE | 任意ユーザー | 例外発生 |
| 職務分離 | 同一ユーザーが申請・承認 | API層で制御 | 対象外（API層責務） |

---

## 6. 受け入れ条件

- [ ] 5つのマイグレーションファイルが作成されている
- [ ] 全マイグレーションがエラーなく適用できる
- [ ] RLSポリシーが正しく機能する（申請者/承認者/監査担当）
- [ ] approval_logsのUPDATE/DELETEが禁止されている
- [ ] user_rolesテーブルが作成され、初期ルートがシードされている

---

## 7. 依存関係

**先行（このPRの前提）:**
- 親Issue #5 の調査完了（J-SOX要件、承認権限マトリックス）

**後続（このPRに依存）:**
- #7 feat(api): IPO稟議ワークフロー - API
- #8 feat(ui): IPO稟議ワークフロー - UI

**マージ順序（Stacked PR）:**
- REQ-6 (DB要件) → DEV-6 (DB実装) → REQ-7 (API要件) → DEV-7 (API実装) → REQ-8 (UI要件) → DEV-8 (UI実装)
