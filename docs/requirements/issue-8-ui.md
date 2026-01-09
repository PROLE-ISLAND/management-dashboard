# requirements: IPO稟議ワークフロー UI

**Issue**: #8 feat(ui): IPO稟議ワークフロー - UI
**親Issue**: #5
**依存**: #7 feat(api): IPO稟議ワークフロー - API（完了済み）

---

## 1. 調査レポート

**調査レポートリンク**: 親Issue #5 参照（J-SOX要件、承認権限マトリックス設計）

### Investigation Report v1 要約

| 項目 | 内容 |
|------|------|
| 既存システム名 | management-dashboard（経営ダッシュボード） |
| エントリーポイント | UI: Next.js App Router / API: `/api/approvals/*` |
| 主要データモデル | ApprovalRequest, ApprovalStep, ApprovalRoute, ApprovalLog |
| UI基盤 | shadcn/ui + Tailwind CSS + AG Grid |

### 既存Storybookパターン確認

| パターン | 確認済みファイル | 採用要素 |
|---------|----------------|---------|
| Card | Card.stories.tsx | glassmorphism (`bg-card/50 backdrop-blur-xl`) |
| DataTable | DataTable.stories.tsx | AG Grid + StatusCell |
| EmptyState | EmptyState.stories.tsx | NoDataState/ErrorState/action付き |
| DesignTokens | DesignTokens.stories.tsx | Primary/Destructive色、spacing |

---

## 2. 要件定義・ユースケース

### 2.1 機能概要

| 項目 | 内容 |
|------|------|
| **なぜ必要か（Why）** | IPO準備に向けたJ-SOX内部統制要件を満たす承認ワークフローUIが必要 |
| **誰が使うか（Who）** | 申請者（全社員）、承認者（課長・部長・役員）、監査担当者 |
| **何を達成するか（What）** | 稟議申請・承認・監査ログ閲覧をWebUIで完結 |

### 2.2 ユースケース定義（Role × Outcome）

| UC-ID | Role | Outcome | Channel |
|-------|------|---------|---------|
| UC-UI-01 | 申請者 | 稟議申請フォームで新規申請を作成できる | WEB |
| UC-UI-02 | 申請者 | 申請前に承認ルートをプレビューできる | WEB |
| UC-UI-03 | 申請者 | 下書き保存・編集・削除ができる | WEB |
| UC-UI-04 | 承認者 | 承認待ち一覧で自分宛の申請を確認できる | WEB |
| UC-UI-05 | 承認者 | 申請詳細画面で承認/却下/差戻しができる | WEB |
| UC-UI-06 | 承認者 | コメント付きで承認/却下できる | WEB |
| UC-UI-07 | 監査担当者 | 監査ログテーブルで全操作履歴を閲覧できる | WEB |
| UC-UI-08 | 監査担当者 | 日付・アクション種別でフィルタリングできる | WEB |

---

## 3. 品質基準

### 3.1 DoD Level 選択

- [ ] Bronze (80%カバレッジ)
- [x] Silver (85%カバレッジ) ← 選択
- [ ] Gold (95%カバレッジ)

**理由**: フロントエンドはAPI統合が必要であり、Silver品質でバリアント対応を必須とする。

### 3.2 Pre-mortem（失敗シナリオ）

| # | 失敗シナリオ | 発生確率 | 対策 |
|---|-------------|---------|------|
| 1 | APIレスポンス遅延でUIがフリーズ | 中 | Loading状態 + スケルトンUI表示 |
| 2 | 認証切れで承認操作が失敗 | 中 | エラーハンドリング + 再ログイン誘導 |
| 3 | バリデーションエラー表示が不明確 | 低 | react-hook-form + zodでフィールド単位エラー |
| 4 | 承認ルートが複雑で視認性が悪い | 中 | ステップ図式化 + 現在位置ハイライト |
| 5 | モバイル表示でテーブルが崩れる | 低 | レスポンシブ対応 + 横スクロール |

---

## 4. 技術設計

### 4.1 DB設計

**既存**: #6で完了済み（`approval_requests`, `approval_steps`, `approval_routes`, `approval_logs`）

### 4.2 API設計

**既存**: #7で完了済み
- `GET /api/approvals` - 一覧取得
- `POST /api/approvals` - 新規作成
- `GET /api/approvals/pending` - 承認待ち一覧
- `GET /api/approvals/:id` - 詳細取得
- `PUT /api/approvals/:id` - 更新
- `DELETE /api/approvals/:id` - 削除
- `POST /api/approvals/:id/submit` - 申請提出
- `POST /api/approvals/:id/approve` - 承認
- `POST /api/approvals/:id/reject` - 却下
- `POST /api/approvals/:id/return` - 差戻し
- `GET /api/audit-logs` - 監査ログ一覧

### 4.3 UI設計

#### ディレクトリ構成

```
src/
├── app/(dashboard)/
│   ├── approvals/
│   │   ├── page.tsx              # 自分の申請一覧
│   │   ├── new/page.tsx          # 新規申請
│   │   ├── pending/page.tsx      # 承認待ち一覧
│   │   └── [id]/page.tsx         # 申請詳細・承認操作
│   └── audit-logs/
│       └── page.tsx              # 監査ログ
├── components/
│   ├── approvals/
│   │   ├── ApprovalForm.tsx      # 申請フォーム
│   │   ├── ApprovalRoutePreview.tsx  # ルートプレビュー
│   │   ├── PendingApprovalList.tsx   # 承認待ち一覧
│   │   └── ApprovalActions.tsx   # 承認/却下/差戻し
│   └── audit/
│       └── AuditLogTable.tsx     # 監査ログテーブル
└── lib/
    └── approvals/
        └── types.ts              # フロント用型定義
```

#### コンポーネント仕様

| コンポーネント | Props | 責務 |
|---------------|-------|------|
| ApprovalForm | `onSubmit`, `defaultValues?`, `isLoading` | 稟議申請フォーム |
| ApprovalRoutePreview | `amount`, `category?` | 承認ルートプレビュー |
| PendingApprovalList | `data`, `isLoading`, `onSelect` | 承認待ち一覧 |
| ApprovalActions | `requestId`, `onSuccess` | 承認/却下/差戻しボタン |
| AuditLogTable | `data`, `isLoading`, `filter` | 監査ログテーブル |

---

## 4.5 Storybook設計

### コンポーネント一覧

| コンポーネント | 配置先 | Stories数 |
|---------------|--------|----------|
| ApprovalForm | `src/stories/ApprovalForm.stories.tsx` | 4バリアント |
| ApprovalRoutePreview | `src/stories/ApprovalRoutePreview.stories.tsx` | 4バリアント |
| PendingApprovalList | `src/stories/PendingApprovalList.stories.tsx` | 4バリアント |
| ApprovalActions | `src/stories/ApprovalActions.stories.tsx` | 4バリアント |
| AuditLogTable | `src/stories/AuditLogTable.stories.tsx` | 4バリアント |

### バリアント定義（DLEE）

#### ApprovalForm

| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | 入力待ち | 空のフォーム | `approval-form` |
| **Loading** | 送信中 | ボタン無効化 + スピナー | `approval-form-loading` |
| **Empty** | N/A（フォームは常に表示） | - | - |
| **Error** | バリデーションエラー | フィールドエラー表示 | `approval-form-error` |

#### ApprovalRoutePreview

| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | ルート表示 | 承認者ステップ図 | `approval-route-preview` |
| **Loading** | 取得中 | スケルトンUI | `approval-route-preview-loading` |
| **Empty** | ルートなし | 「該当ルートなし」 | `approval-route-preview-empty` |
| **Error** | エラー | 「ルート取得失敗」 | `approval-route-preview-error` |

#### PendingApprovalList

| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | データあり | 承認待ちカード一覧 | `pending-approval-list` |
| **Loading** | 取得中 | スケルトンカード×3 | `pending-approval-list-loading` |
| **Empty** | データなし | 「承認待ちの申請はありません」 | `pending-approval-list-empty` |
| **Error** | エラー | 「読み込み失敗」+ 再試行 | `pending-approval-list-error` |

#### ApprovalActions

| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | 操作可能 | 承認/却下/差戻しボタン | `approval-actions` |
| **Loading** | 処理中 | ボタン無効化 + スピナー | `approval-actions-loading` |
| **Empty** | 権限なし | 「操作権限がありません」 | `approval-actions-empty` |
| **Error** | エラー | 「操作に失敗しました」 | `approval-actions-error` |

#### AuditLogTable

| バリアント | 状態 | 表示内容 | data-testid |
|-----------|------|---------|-------------|
| **Default** | データあり | AG Gridテーブル | `audit-log-table` |
| **Loading** | 取得中 | AG Grid loading overlay | `audit-log-table-loading` |
| **Empty** | データなし | 「監査ログがありません」 | `audit-log-table-empty` |
| **Error** | エラー | 「ログ取得失敗」+ 再試行 | `audit-log-table-error` |

### Storybookストーリーテンプレート

```tsx
// src/stories/ApprovalForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ApprovalForm } from '@/components/approvals/ApprovalForm';

const meta: Meta<typeof ApprovalForm> = {
  title: 'Approvals/ApprovalForm',
  component: ApprovalForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ApprovalForm>;

export const Default: Story = {
  args: {
    onSubmit: async (data) => console.log(data),
  },
};

export const Loading: Story = {
  args: {
    onSubmit: async (data) => console.log(data),
    isLoading: true,
  },
};

export const WithDefaultValues: Story = {
  args: {
    onSubmit: async (data) => console.log(data),
    defaultValues: {
      title: '出張費用申請',
      amount: 85000,
      category: 'expense',
      description: '大阪出張の交通費・宿泊費',
    },
  },
};

export const Error: Story = {
  args: {
    onSubmit: async () => { throw new Error('Validation failed'); },
  },
};
```

### 品質チェック

- [x] 全4バリアント（DLEE）が定義されている
- [x] 各バリアントの表示内容が具体的
- [x] data-testid が計画されている
- [x] 既存Storybookパターン（DataTable, EmptyState, Card）を活用

---

## 5. テスト設計

### 5.1 GWT仕様

#### UC-UI-01: 稟議申請フォーム

```gherkin
Feature: 稟議申請フォーム

Scenario: 正常な申請作成
  Given ユーザーが稟議申請画面を開いている
  When 件名「出張費用申請」、金額「85000」、種別「expense」を入力
  And 「申請する」ボタンをクリック
  Then 申請が作成され、一覧画面に遷移する
  And トースト「申請を作成しました」が表示される

Scenario: バリデーションエラー
  Given ユーザーが稟議申請画面を開いている
  When 件名を空のまま「申請する」ボタンをクリック
  Then 「件名は必須です」エラーが表示される
```

#### UC-UI-04: 承認待ち一覧

```gherkin
Feature: 承認待ち一覧

Scenario: 承認待ち一覧表示
  Given 承認者がログインしている
  When 承認待ち一覧画面を開く
  Then 自分宛の承認待ち申請が表示される

Scenario: 承認待ちがない場合
  Given 承認者がログインしている
  And 承認待ちの申請がない
  When 承認待ち一覧画面を開く
  Then 「承認待ちの申請はありません」が表示される
```

### 5.2 単体テスト設計

| テストファイル | テスト対象 | テストケース |
|--------------|----------|-------------|
| `ApprovalForm.test.tsx` | ApprovalForm | フォーム入力、バリデーション、送信 |
| `ApprovalRoutePreview.test.tsx` | ApprovalRoutePreview | ルート表示、金額別ルート |
| `PendingApprovalList.test.tsx` | PendingApprovalList | 一覧表示、Empty状態、クリック |
| `ApprovalActions.test.tsx` | ApprovalActions | 承認、却下、差戻し、権限なし |
| `AuditLogTable.test.tsx` | AuditLogTable | テーブル表示、フィルタ |

### 5.3 統合テスト設計

| シナリオ | 検証内容 |
|---------|---------|
| 申請フロー | フォーム入力 → 送信 → API呼び出し → 成功表示 |
| 承認フロー | 一覧選択 → 詳細表示 → 承認 → API呼び出し → 一覧更新 |

---

## 6. 実装計画

### フェーズ1: 基盤（Day 1）
1. 型定義作成（`lib/approvals/types.ts`）
2. ApprovalForm コンポーネント
3. ApprovalForm.stories.tsx

### フェーズ2: 一覧・プレビュー（Day 2）
4. ApprovalRoutePreview コンポーネント
5. PendingApprovalList コンポーネント
6. Stories追加

### フェーズ3: 操作・監査（Day 3）
7. ApprovalActions コンポーネント
8. AuditLogTable コンポーネント
9. Stories追加

### フェーズ4: ページ統合（Day 4）
10. ページルーティング作成
11. API統合
12. バリアント対応確認

### フェーズ5: テスト・検証（Day 5）
13. 単体テスト作成
14. DoD検証
15. PR作成

---

## チェックリスト

- [x] 調査レポートがリンクされている
- [x] ユースケースがRole × Outcomeで定義されている
- [x] DoD Levelが選択・理由記載されている
- [x] Pre-mortemで5つの失敗シナリオ
- [x] 技術設計（DB/API/UI）が記載されている
- [x] Storybook設計が記載されている（UI機能）
- [x] 全5コンポーネント × 4バリアント（DLEE）が定義されている
- [x] テスト設計が記載されている
