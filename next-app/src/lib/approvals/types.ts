/**
 * IPO稟議ワークフロー - 型定義
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 */

// ============================================
// 基本型定義
// ============================================

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ApprovalCategory = 'expense' | 'purchase' | 'contract' | 'other';
export type StepStatus = 'pending' | 'approved' | 'rejected' | 'skipped';
export type UserRole = 'employee' | 'manager' | 'director' | 'executive' | 'auditor' | 'admin';
export type AuditAction = 'create' | 'update' | 'submit' | 'approve' | 'reject' | 'return' | 'cancel' | 'delete';

// ============================================
// エンティティ型
// ============================================

export interface ApprovalRoute {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number | null;
  category: ApprovalCategory | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: ApprovalCategory | null;
  requester_id: string;
  route_id: string;
  status: ApprovalStatus;
  submitted_at: string | null;
  completed_at: string | null;
  linked_cost_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  request_id: string;
  step_order: number;
  step_group: number;
  approver_id: string;
  approver_role: UserRole;
  status: StepStatus;
  required_count: number;
  comment: string | null;
  acted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalLog {
  id: string;
  request_id: string;
  action: AuditAction;
  actor_id: string;
  actor_role: UserRole;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ApprovalDelegation {
  id: string;
  delegator_id: string;
  delegate_id: string;
  start_date: string;
  end_date: string;
  max_amount: number | null;
  reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  description: string | null;
  created_at: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

// ============================================
// リクエスト型
// ============================================

export interface CreateApprovalInput {
  title: string;
  description?: string;
  amount: number;
  category?: ApprovalCategory;
}

export interface UpdateApprovalInput {
  title?: string;
  description?: string;
  amount?: number;
  category?: ApprovalCategory;
}

export interface ApproveInput {
  comment?: string;
}

export interface RejectInput {
  comment: string;  // 却下時はコメント必須
}

export interface ReturnInput {
  comment: string;  // 差戻し時はコメント必須
}

// ============================================
// レスポンス型
// ============================================

export interface UserInfo {
  id: string;
  email: string;
}

export interface RouteInfo {
  id: string;
  name: string;
}

export interface StepInfo {
  id: string;
  step_order: number;
  step_group: number;
  approver: UserInfo;
  approver_role: UserRole;
  status: StepStatus;
  required_count: number;
  comment: string | null;
  acted_at: string | null;
}

export interface AttachmentInfo {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: UserInfo;
  description: string | null;
  created_at: string;
}

export interface ApprovalResponse {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: ApprovalCategory | null;
  status: ApprovalStatus;
  requester: UserInfo;
  route: RouteInfo;
  current_step_group: number | null;
  steps: StepInfo[];
  attachments: AttachmentInfo[];
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalListItem {
  id: string;
  title: string;
  amount: number;
  category: ApprovalCategory | null;
  status: ApprovalStatus;
  requester: UserInfo;
  route: RouteInfo;
  current_step_group: number | null;
  submitted_at: string | null;
  created_at: string;
}

export interface ActionResponse {
  success: boolean;
  request: ApprovalResponse;
  next_step?: {
    group: number;
    approvers: Array<UserInfo & { role: UserRole }>;
  };
}

export interface AuditLogResponse {
  id: string;
  request_id: string;
  request_title: string;
  action: AuditAction;
  actor: UserInfo;
  actor_role: UserRole;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================
// エラー型
// ============================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ============================================
// カスタムエラークラス
// ============================================

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '認証が必要です') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'この操作を行う権限がありません') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'リソースが見つかりません') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

// ============================================
// ページネーション型
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================
// フィルター型
// ============================================

export interface ApprovalListFilter {
  status?: ApprovalStatus;
  category?: ApprovalCategory;
  requester_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface AuditLogFilter {
  request_id?: string;
  action?: AuditAction;
  actor_id?: string;
  from_date?: string;
  to_date?: string;
}
