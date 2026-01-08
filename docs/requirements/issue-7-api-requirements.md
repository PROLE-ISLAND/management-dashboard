# Requirements: IPO稟議ワークフロー - API

Issue: #7
Parent: #5 (IPO稟議ワークフローシステム)
Depends: #6 (DBスキーマ)

---

## 1. 調査レポート

**調査レポートリンク**: 親Issue #5 参照（J-SOX要件、承認権限マトリックス設計）

### Investigation Report v1 要約

| 項目 | 内容 |
|------|------|
| 既存システム名 | management-dashboard（経営ダッシュボード） |
| エントリーポイント | API: `/api/approvals/*` |
| 主要データモデル | approval.requests, approval.steps, approval.logs |
| 技術スタック | Next.js 14 App Router, Supabase, TypeScript |

---

## 2. 要件定義・ユースケース

### 2.1 機能概要

| 項目 | 内容 |
|------|------|
| **なぜ必要か（Why）** | IPO準備における内部統制強化。J-SOX準拠の承認ワークフロー実現 |
| **誰が使うか（Who）** | 一般社員（申請者）、課長/部長/役員（承認者）、監査担当者 |
| **何を達成するか（What）** | 稟議の電子申請・承認・監査証跡の完全自動化 |

### 2.2 ユースケース定義（Role × Outcome）

| UC-ID | Role | Outcome | Channel | Priority |
|-------|------|---------|---------|----------|
| UC-01 | 社員 | 稟議を下書き保存できる | API | P1 |
| UC-02 | 社員 | 稟議を申請できる | API | P1 |
| UC-03 | 社員 | 自分の稟議状況を確認できる | API | P1 |
| UC-04 | 承認者 | 承認待ち一覧を取得できる | API | P1 |
| UC-05 | 承認者 | 稟議を承認できる | API | P1 |
| UC-06 | 承認者 | 稟議を却下できる | API | P1 |
| UC-07 | 承認者 | 稟議を差戻しできる | API | P2 |
| UC-08 | 監査担当 | 監査ログを閲覧できる | API | P1 |
| UC-09 | 監査担当 | 監査ログをCSVエクスポートできる | API | P2 |
| UC-10 | システム | 金額に応じた承認ルートを自動選択 | API | P1 |
| UC-11 | システム | 全操作を監査ログに自動記録 | API | P1 |

### 2.3 ビジネスルール

| BR-ID | ルール | 根拠 |
|-------|--------|------|
| BR-01 | 申請者は自分の稟議を承認できない（職務分離） | J-SOX |
| BR-02 | 承認済み稟議は編集不可 | 監査証跡保全 |
| BR-03 | 監査ログは追記のみ（UPDATE/DELETE不可） | J-SOX |
| BR-04 | 金額に応じて承認ルートを自動選択 | 内部統制 |
| BR-05 | 並列承認グループは required_count 分の承認で次へ | ワークフロー |
| BR-06 | 代理承認は委任期間内かつ金額上限以下の場合のみ有効 | 内部統制 |
| BR-07 | 却下された稟議は再申請可能（新規稟議として作成） | ワークフロー |
| BR-08 | 差戻し後は下書き状態に戻り、金額変更時はルート再選択 | 内部統制 |

---

## 3. 品質基準

### 3.1 DoD Level 選択

- [ ] Bronze (80%カバレッジ)
- [x] Silver (85%カバレッジ)
- [ ] Gold (95%カバレッジ)

**選択理由**: J-SOX準拠のビジネスロジックを含むため、十分なテストカバレッジが必要。ただしE2Eは UI 実装時に行うため Silver。

### 3.2 Pre-mortem（失敗シナリオ）

| # | 失敗シナリオ | 発生確率 | 影響度 | 対策 |
|---|-------------|---------|--------|------|
| 1 | 職務分離チェック漏れで申請者が自己承認 | 中 | 高 | API層で必ず requester_id != approver_id を検証 |
| 2 | 承認ルート選択ロジックのバグで誤ったルート適用 | 中 | 高 | 金額範囲の境界値テストを徹底 |
| 3 | 監査ログ記録失敗時にトランザクションがコミット | 低 | 高 | ログ記録をトランザクション内で実行、失敗時はロールバック |
| 4 | 並列承認で required_count 判定ミス | 中 | 中 | グループ内承認数カウントのユニットテスト追加 |
| 5 | 認証なしでAPIアクセス可能 | 低 | 高 | 全エンドポイントで Supabase Auth 検証必須 |

---

## 4. 技術設計

### 4.1 API設計

| Method | Path | 説明 | 認証 | Rate Limit |
|--------|------|------|------|------------|
| GET | `/api/approvals` | 稟議一覧取得 | 必要 | 100/min |
| GET | `/api/approvals/:id` | 稟議詳細取得 | 必要 | 100/min |
| POST | `/api/approvals` | 稟議新規作成 | 必要 | 30/min |
| PUT | `/api/approvals/:id` | 稟議更新（下書きのみ） | 必要 | 30/min |
| DELETE | `/api/approvals/:id` | 稟議削除（下書きのみ） | 必要 | 10/min |
| POST | `/api/approvals/:id/submit` | 稟議申請 | 必要 | 10/min |
| POST | `/api/approvals/:id/approve` | 承認 | 必要 | 30/min |
| POST | `/api/approvals/:id/reject` | 却下 | 必要 | 30/min |
| POST | `/api/approvals/:id/return` | 差戻し | 必要 | 30/min |
| GET | `/api/approvals/pending` | 承認待ち一覧 | 必要 | 100/min |
| GET | `/api/audit-logs` | 監査ログ一覧 | 必要 | 50/min |
| GET | `/api/audit-logs/export` | 監査ログCSV | 必要 | 5/min |

### 4.2 リクエスト/レスポンス型

```typescript
// POST /api/approvals
interface CreateApprovalRequest {
  title: string;          // 1-200文字
  description?: string;   // 最大5000文字
  amount: number;         // 0以上
  category?: 'expense' | 'purchase' | 'contract' | 'other';
}

interface ApprovalResponse {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  requester: { id: string; email: string; };
  route: { id: string; name: string; };
  current_step_group: number | null;
  steps: ApprovalStep[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

// POST /api/approvals/:id/approve
interface ApproveRequest {
  comment?: string;  // 最大1000文字
}

interface ActionResponse {
  success: boolean;
  request: ApprovalResponse;
  next_step?: {
    group: number;
    approvers: { id: string; email: string; role: string; }[];
  };
}
```

### 4.3 エラーレスポンス

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// エラーコード一覧
const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,        // 状態遷移エラー
  INTERNAL_ERROR: 500,
} as const;
```

### 4.4 ディレクトリ構成

```
src/
├── app/api/
│   ├── approvals/
│   │   ├── route.ts                    # GET(一覧), POST(作成)
│   │   ├── pending/
│   │   │   └── route.ts                # GET(承認待ち一覧)
│   │   └── [id]/
│   │       ├── route.ts                # GET(詳細), PUT(更新), DELETE(削除)
│   │       ├── submit/
│   │       │   └── route.ts            # POST(申請)
│   │       ├── approve/
│   │       │   └── route.ts            # POST(承認)
│   │       ├── reject/
│   │       │   └── route.ts            # POST(却下)
│   │       └── return/
│   │           └── route.ts            # POST(差戻し)
│   └── audit-logs/
│       ├── route.ts                    # GET(一覧)
│       └── export/
│           └── route.ts                # GET(CSV)
├── lib/
│   └── approvals/
│       ├── service.ts                  # ビジネスロジック
│       ├── repository.ts               # データアクセス
│       ├── route-selector.ts           # 承認ルート選択
│       ├── validators.ts               # バリデーション(zod)
│       ├── types.ts                    # 型定義
│       └── __tests__/
│           ├── service.test.ts
│           ├── repository.test.ts
│           ├── route-selector.test.ts
│           └── validators.test.ts
└── lib/
    └── audit/
        ├── logger.ts                   # 監査ログ記録
        └── __tests__/
            └── logger.test.ts
```

### 4.5 主要ビジネスロジック

```typescript
// 職務分離チェック（BR-01）
function validateSeparationOfDuties(
  requesterId: string,
  approverId: string
): void {
  if (requesterId === approverId) {
    throw new ForbiddenError('申請者自身は承認できません');
  }
}

// 承認ルート選択（BR-04）
async function selectRoute(
  amount: number,
  category?: string
): Promise<Route> {
  const routes = await db.query(`
    SELECT * FROM approval.routes
    WHERE (category = $1 OR category IS NULL)
      AND min_amount <= $2
      AND (max_amount IS NULL OR max_amount >= $2)
    ORDER BY category NULLS LAST, min_amount DESC
    LIMIT 1
  `, [category, amount]);

  if (!routes.length) {
    throw new Error('適用可能な承認ルートがありません');
  }
  return routes[0];
}

// 並列承認判定（BR-05）
async function checkGroupApproval(
  requestId: string,
  stepGroup: number
): Promise<{ completed: boolean; nextGroup?: number }> {
  const stats = await db.query(`
    SELECT
      required_count,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count
    FROM approval.steps
    WHERE request_id = $1 AND step_group = $2
    GROUP BY required_count
  `, [requestId, stepGroup]);

  if (stats.approved_count >= stats.required_count) {
    // 残りをスキップ
    await db.query(`
      UPDATE approval.steps
      SET status = 'skipped', updated_at = NOW()
      WHERE request_id = $1 AND step_group = $2 AND status = 'pending'
    `, [requestId, stepGroup]);

    // 次グループ確認
    const nextGroup = await getNextStepGroup(requestId, stepGroup);
    return { completed: true, nextGroup };
  }

  return { completed: false };
}
```

---

## 5. テスト設計

### 5.1 GWT仕様（E2E用 - UI実装時に使用）

| ID | Given | When | Then |
|----|-------|------|------|
| E2E-01 | 社員がログイン済み | 稟議を作成・申請 | 承認待ち状態になる |
| E2E-02 | 承認者がログイン済み | 承認待ち稟議を承認 | 次の承認者に回る or 承認完了 |
| E2E-03 | 監査担当がログイン済み | 監査ログを閲覧 | 全履歴が表示される |

### 5.2 単体テスト設計

| ファイル | テスト対象 | テストケース |
|---------|-----------|-------------|
| `service.test.ts` | createApproval | 正常作成、バリデーションエラー |
| `service.test.ts` | submitApproval | 下書きから申請、承認中は申請不可 |
| `service.test.ts` | approveStep | 正常承認、職務分離違反、二重承認防止 |
| `service.test.ts` | approveByDelegate | 代理承認（期間内/外、金額上限内/超過） |
| `service.test.ts` | returnStep | 差戻し→下書き状態、金額変更→ルート再選択 |
| `service.test.ts` | rejectStep | 却下→rejected状態、再申請は新規作成 |
| `route-selector.test.ts` | selectRoute | 10万円→課長、50万円→部長、100万円→役員、1000万円→取締役会 |
| `route-selector.test.ts` | selectRoute | 境界値: 100000, 100001, 500000, 500001 |
| `route-selector.test.ts` | selectRoute | カテゴリ別ルート選択（contract） |
| `validators.test.ts` | createApprovalSchema | 必須項目、文字数制限、金額範囲 |
| `logger.test.ts` | logAuditAction | submit/approve/reject/return 記録 |

### 5.3 統合テスト設計

| ID | シナリオ | 検証ポイント |
|----|---------|-------------|
| INT-01 | 稟議CRUD一連フロー | 作成→更新→申請→承認→完了 |
| INT-02 | 並列承認フロー | 2人中1人承認→残りスキップ→次グループ |
| INT-03 | 却下・差戻しフロー | 却下→ステータス更新、差戻し→下書きに戻る→金額変更→ルート再選択 |
| INT-04 | 監査ログ完全性 | 全操作がログに記録される |
| INT-05 | 認証・認可 | 未認証拒否、他人の稟議アクセス拒否、職務分離 |
| INT-06 | 代理承認フロー | 委任期間内→承認可、期間外→拒否、金額超過→拒否 |

### 5.4 テストファイル一覧

| ソースファイル | テストファイル |
|---------------|---------------|
| `src/lib/approvals/service.ts` | `src/lib/approvals/__tests__/service.test.ts` |
| `src/lib/approvals/repository.ts` | `src/lib/approvals/__tests__/repository.test.ts` |
| `src/lib/approvals/route-selector.ts` | `src/lib/approvals/__tests__/route-selector.test.ts` |
| `src/lib/approvals/validators.ts` | `src/lib/approvals/__tests__/validators.test.ts` |
| `src/lib/audit/logger.ts` | `src/lib/audit/__tests__/logger.test.ts` |

### 5.5 カバレッジマトリクス（MECE証明表）

| UC/BR | Unit Test | Integration Test | E2E Test | 備考 |
|-------|-----------|-----------------|----------|------|
| UC-01 | service.test.ts#createApproval | INT-01 | E2E-01 | 下書き保存 |
| UC-02 | service.test.ts#submitApproval | INT-01 | E2E-01 | 稟議申請 |
| UC-03 | repository.test.ts#findByRequester | INT-01 | E2E-01 | 自分の稟議確認 |
| UC-04 | repository.test.ts#findPending | INT-05 | E2E-02 | 承認待ち一覧 |
| UC-05 | service.test.ts#approveStep | INT-01, INT-02 | E2E-02 | 承認 |
| UC-06 | service.test.ts#rejectStep | INT-03 | - | 却下 |
| UC-07 | service.test.ts#returnStep | INT-03 | - | 差戻し |
| UC-08 | logger.test.ts#getAuditLogs | INT-04 | E2E-03 | 監査ログ閲覧 |
| UC-09 | logger.test.ts#exportCsv | INT-04 | - | CSVエクスポート |
| UC-10 | route-selector.test.ts#selectRoute | INT-01 | - | ルート自動選択 |
| UC-11 | logger.test.ts#logAuditAction | INT-04 | - | 監査ログ記録 |
| BR-01 | service.test.ts#職務分離 | INT-05 | - | 申請者≠承認者 |
| BR-02 | service.test.ts#編集不可 | INT-01 | - | 承認済み編集禁止 |
| BR-03 | logger.test.ts#追記のみ | INT-04 | - | ログ不変性 |
| BR-04 | route-selector.test.ts#境界値 | INT-01 | - | 金額別ルート |
| BR-05 | service.test.ts#並列承認 | INT-02 | - | required_count判定 |
| BR-06 | service.test.ts#代理承認検証 | INT-06 | - | 委任期間・金額上限 |
| BR-07 | service.test.ts#却下後再申請 | INT-03 | - | 新規稟議として作成 |
| BR-08 | service.test.ts#差戻し後編集 | INT-03 | - | ルート再選択 |

**カバレッジ分析:**
- Unit Test: 19/19 (100%)
- Integration Test: 19/19 (100%)
- E2E Test: 7/19 (37%) ※UI実装時に追加予定

---

## 6. 変更ファイル一覧

| ファイル | 変更種別 | 概要 |
|---------|---------|------|
| `src/app/api/approvals/route.ts` | 新規 | 稟議一覧・作成 |
| `src/app/api/approvals/pending/route.ts` | 新規 | 承認待ち一覧 |
| `src/app/api/approvals/[id]/route.ts` | 新規 | 稟議詳細・更新・削除 |
| `src/app/api/approvals/[id]/submit/route.ts` | 新規 | 稟議申請 |
| `src/app/api/approvals/[id]/approve/route.ts` | 新規 | 承認 |
| `src/app/api/approvals/[id]/reject/route.ts` | 新規 | 却下 |
| `src/app/api/approvals/[id]/return/route.ts` | 新規 | 差戻し |
| `src/app/api/audit-logs/route.ts` | 新規 | 監査ログ一覧 |
| `src/app/api/audit-logs/export/route.ts` | 新規 | 監査ログCSV |
| `src/lib/approvals/service.ts` | 新規 | ビジネスロジック |
| `src/lib/approvals/repository.ts` | 新規 | データアクセス |
| `src/lib/approvals/route-selector.ts` | 新規 | 承認ルート選択 |
| `src/lib/approvals/validators.ts` | 新規 | バリデーション |
| `src/lib/approvals/types.ts` | 新規 | 型定義 |
| `src/lib/audit/logger.ts` | 新規 | 監査ログ記録 |

---

## 7. 受け入れ条件

- [ ] 全APIエンドポイント実装
- [ ] 入力バリデーション（zod）
- [ ] 職務分離チェック（申請者 != 承認者）
- [ ] 承認ルート自動選択
- [ ] 並列承認グループ対応
- [ ] 監査ログ自動記録
- [ ] 認証・認可チェック
- [ ] テストカバレッジ 85%以上

---

## 8. 次のステップ

完了後 → #8 feat(ui): IPO稟議ワークフロー - UI
