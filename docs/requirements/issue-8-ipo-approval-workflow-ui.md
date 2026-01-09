## 1. 調査レポート

**調査レポートリンク**: 親Issue #5 参照（J-SOX要件、東証グロース審査基準、承認権限マトリックス設計）

### Investigation Report 要約

| 項目 | 内容 |
|------|------|
| 既存システム名 | management-dashboard（経営ダッシュボード） |
| エントリーポイント | UI: `/approvals/*` |
| 主要データモデル | Approval, ApprovalStep, AuditLog |
| 依存Sub-Issue | #7 (API), #6 (DB) - PR #10でDBスキーマ実装中 |

### 競合調査結果
| サービス | 参考機能 |
|---------|---------|
| freee会計 | 金額別承認ルート、監査ログ |
| マネーフォワード | J-SOX対応の監査証跡 |
| ジョブカン | 複数段階承認、代理承認 |

---

## 2. 要件定義・ユースケース

### 2.1 機能概要

| 項目 | 内容 |
|------|------|
| **なぜ必要か（Why）** | 上場審査（IPO）基準を満たす稟議ワークフローUI。現状Slack/メールベースで監査証跡が残らない問題を解決 |
| **誰が使うか（Who）** | 申請者（全社員）、承認者（課長/部長/役員）、監査担当 |
| **何を達成するか（What）** | 稟議申請→承認→完了の一連フローをUI化し、監査証跡を担保 |

### 2.2 ユースケース定義（Role × Outcome）

| UC-ID | Role | Outcome | Channel |
|-------|------|---------|---------|
| UC-APPROVAL-REQUESTER-SUBMIT-WEB | 申請者 | 稟議を申請したい | WEB |
| UC-APPROVAL-MANAGER-APPROVE-WEB | 承認者（課長） | 部下の稟議を承認/却下したい | WEB |
| UC-APPROVAL-DIRECTOR-APPROVE-WEB | 承認者（部長） | 高額稟議を承認したい | WEB |
| UC-APPROVAL-EXECUTIVE-APPROVE-WEB | 承認者（役員） | 重要稟議を最終承認したい | WEB |
| UC-APPROVAL-AUDITOR-AUDIT-WEB | 監査担当 | 承認履歴を監査したい | WEB |

---

## 3. 品質基準

### 3.1 DoD Level 選択

- [ ] Bronze (80%カバレッジ)
- [x] Silver (85%カバレッジ) ← 選択
- [ ] Gold (95%カバレッジ)

**選択理由**: 監査対応のため将来的にGold化推奨だが、初期リリースはSilverで進める

### 3.2 Pre-mortem（失敗シナリオ）

| # | 失敗シナリオ | 発生確率 | 対策 |
|---|-------------|---------|------|
| 1 | 承認ルートが金額に応じて正しく表示されない | 中 | ApprovalRoutePreview で金額別テスト |
| 2 | 申請者が自分の稟議を承認できてしまう（職務分離違反） | 高 | API側で検証 + UI側で承認ボタン非表示 |
| 3 | 監査ログの時刻がズレる（タイムゾーン問題） | 中 | UTC保存 + 表示時にローカル変換 |
| 4 | 大量の承認待ちでパフォーマンス劣化 | 低 | ページネーション + 仮想スクロール検討 |

---

## 4. 技術設計

### 4.1 画面構成

| 画面 | パス | 用途 |
|------|------|------|
| 稟議一覧 | `/approvals` | 自分の稟議一覧 |
| 稟議申請 | `/approvals/new` | 新規稟議申請 |
| 承認待ち | `/approvals/pending` | 承認待ち一覧 |
| 稟議詳細 | `/approvals/[id]` | 詳細・承認操作 |
| 監査ログ | `/audit-logs` | 監査証跡閲覧 |

### 4.2 コンポーネント設計

| コンポーネント | 責務 | data-testid |
|---------------|------|-------------|
| `ApprovalForm.tsx` | 稟議申請フォーム | `approval-form` |
| `ApprovalRoutePreview.tsx` | 承認ルートプレビュー | `approval-route-preview` |
| `PendingApprovalList.tsx` | 承認待ち一覧 | `pending-approval-list` |
| `ApprovalActions.tsx` | 承認/却下/差戻し | `approval-actions` |
| `AuditLogTable.tsx` | 監査ログテーブル | `audit-log-table` |

### 4.3 API連携（#7 API依存）

| API | メソッド | 用途 |
|-----|---------|------|
| `/api/approvals` | GET | 稟議一覧取得 |
| `/api/approvals` | POST | 稟議申請 |
| `/api/approvals/pending` | GET | 承認待ち一覧 |
| `/api/approvals/[id]/approve` | POST | 承認 |
| `/api/approvals/[id]/reject` | POST | 却下 |
| `/api/audit-logs` | GET | 監査ログ取得 |

---

## 4.5 Storybook設計

### コンポーネント一覧

| コンポーネント | 配置先 | Stories |
|---------------|--------|---------|
| ApprovalForm | `src/components/approvals/` | 4バリアント |
| ApprovalRoutePreview | `src/components/approvals/` | 4バリアント |
| PendingApprovalList | `src/components/approvals/` | 4バリアント |
| ApprovalActions | `src/components/approvals/` | 4バリアント |
| AuditLogTable | `src/components/audit/` | 4バリアント |

### バリアント定義（DLEE）

#### ApprovalForm
| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | 正常入力可能 | フォーム全項目表示 | `approval-form` |
| **Loading** | 送信中 | スピナー + 入力無効化 | `approval-form-skeleton` |
| **Empty** | 初期状態 | 空フォーム | `approval-form-empty` |
| **Error** | バリデーションエラー | エラーメッセージ表示 | `approval-form-error` |

#### PendingApprovalList
| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | データあり | 承認待ちリスト | `pending-approval-list` |
| **Loading** | 取得中 | スケルトン行 | `pending-approval-list-skeleton` |
| **Empty** | 承認待ちなし | 「承認待ちの稟議はありません」 | `pending-approval-list-empty` |
| **Error** | 取得失敗 | 「読み込みに失敗しました」+ リトライ | `pending-approval-list-error` |

#### AuditLogTable
| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | ログあり | 監査ログテーブル | `audit-log-table` |
| **Loading** | 取得中 | スケルトンテーブル | `audit-log-table-skeleton` |
| **Empty** | ログなし | 「監査ログがありません」 | `audit-log-table-empty` |
| **Error** | 取得失敗 | エラー表示 + リトライ | `audit-log-table-error` |

---

## 5. テスト設計

### 5.1 GWT仕様

#### UC-APPROVAL-REQUESTER-SUBMIT-WEB
```gherkin
Scenario: 稟議を申請する
  Given 申請者がログインしている
  When 稟議フォームに必要事項を入力し「申請する」をクリック
  Then 稟議が作成され、承認者に通知される
  And 自分の稟議一覧に表示される
```

#### UC-APPROVAL-MANAGER-APPROVE-WEB
```gherkin
Scenario: 稟議を承認する
  Given 承認者が承認待ち一覧を開いている
  When 稟議を選択し「承認する」をクリック
  Then 稟議のステータスが更新される
  And 監査ログに記録される
  And 次の承認者に通知される（多段階承認の場合）
```

### 5.2 単体テスト設計

| テスト | 対象 | 観点 |
|--------|------|------|
| ApprovalForm.test.tsx | フォームバリデーション | 必須項目、金額範囲 |
| ApprovalRoutePreview.test.tsx | ルート表示 | 金額別承認ルート |
| PendingApprovalList.test.tsx | リスト表示 | ソート、フィルタ |
| ApprovalActions.test.tsx | 操作ボタン | 権限別表示 |

### 5.3 統合テスト設計

| テスト | シナリオ |
|--------|---------|
| 申請→承認フロー | 単段階承認の完了フロー |
| 申請→多段階承認 | 課長→部長→役員の順次承認 |
| 申請→却下 | 却下理由の記録と通知 |

---

## 6. 変更ファイル一覧

| ファイル | 変更種別 | 備考 |
|---------|---------|------|
| `src/app/(dashboard)/approvals/page.tsx` | 新規 | 稟議一覧 |
| `src/app/(dashboard)/approvals/new/page.tsx` | 新規 | 稟議申請 |
| `src/app/(dashboard)/approvals/pending/page.tsx` | 新規 | 承認待ち |
| `src/app/(dashboard)/approvals/[id]/page.tsx` | 新規 | 稟議詳細 |
| `src/app/(dashboard)/audit-logs/page.tsx` | 新規 | 監査ログ |
| `src/components/approvals/ApprovalForm.tsx` | 新規 | |
| `src/components/approvals/ApprovalForm.stories.tsx` | 新規 | |
| `src/components/approvals/ApprovalRoutePreview.tsx` | 新規 | |
| `src/components/approvals/PendingApprovalList.tsx` | 新規 | |
| `src/components/approvals/ApprovalActions.tsx` | 新規 | |
| `src/components/audit/AuditLogTable.tsx` | 新規 | |

---

## 関連リンク

- **Issue**: #8
- **親Issue**: #5
- **API Sub-Issue**: #7
- **DB PR**: #10
