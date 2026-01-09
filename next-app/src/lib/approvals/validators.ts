/**
 * IPO稟議ワークフロー - バリデーション
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 */

import { z } from 'zod';

// ============================================
// 共通バリデーション
// ============================================

export const uuidSchema = z.string().uuid('無効なIDフォーマットです');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// 稟議カテゴリ
// ============================================

export const approvalCategorySchema = z.enum(['expense', 'purchase', 'contract', 'other']);

// ============================================
// 稟議作成
// ============================================

export const createApprovalSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z
    .string()
    .max(5000, '説明は5000文字以内で入力してください')
    .optional(),
  amount: z
    .number()
    .nonnegative('金額は0以上で入力してください')
    .max(999999999999, '金額が上限を超えています'),
  category: approvalCategorySchema.optional(),
});

export type CreateApprovalSchema = z.infer<typeof createApprovalSchema>;

// ============================================
// 稟議更新
// ============================================

export const updateApprovalSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください')
    .optional(),
  description: z
    .string()
    .max(5000, '説明は5000文字以内で入力してください')
    .optional(),
  amount: z
    .number()
    .nonnegative('金額は0以上で入力してください')
    .max(999999999999, '金額が上限を超えています')
    .optional(),
  category: approvalCategorySchema.optional(),
});

export type UpdateApprovalSchema = z.infer<typeof updateApprovalSchema>;

// ============================================
// 承認アクション
// ============================================

export const approveSchema = z.object({
  comment: z
    .string()
    .max(1000, 'コメントは1000文字以内で入力してください')
    .optional(),
});

export type ApproveSchema = z.infer<typeof approveSchema>;

// ============================================
// 却下アクション
// ============================================

export const rejectSchema = z.object({
  comment: z
    .string()
    .min(1, '却下理由は必須です')
    .max(1000, 'コメントは1000文字以内で入力してください'),
});

export type RejectSchema = z.infer<typeof rejectSchema>;

// ============================================
// 差戻しアクション
// ============================================

export const returnSchema = z.object({
  comment: z
    .string()
    .min(1, '差戻し理由は必須です')
    .max(1000, 'コメントは1000文字以内で入力してください'),
});

export type ReturnSchema = z.infer<typeof returnSchema>;

// ============================================
// 稟議一覧フィルター
// ============================================

export const approvalListFilterSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'cancelled']).optional(),
  category: approvalCategorySchema.optional(),
  requester_id: uuidSchema.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
});

export type ApprovalListFilterSchema = z.infer<typeof approvalListFilterSchema>;

// ============================================
// 監査ログフィルター
// ============================================

export const auditLogFilterSchema = z.object({
  request_id: uuidSchema.optional(),
  action: z.enum(['create', 'update', 'submit', 'approve', 'reject', 'return', 'cancel', 'delete']).optional(),
  actor_id: uuidSchema.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
});

export type AuditLogFilterSchema = z.infer<typeof auditLogFilterSchema>;

// ============================================
// バリデーションヘルパー
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Zodスキーマでバリデーションを実行
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return { success: false, errors };
}

/**
 * URLSearchParamsからオブジェクトに変換
 */
export function parseSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
