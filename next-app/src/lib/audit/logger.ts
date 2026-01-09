/**
 * IPO稟議ワークフロー - 監査ログ
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * BR-03: 監査ログは追記のみ（UPDATE/DELETE不可）
 * UC-08: 監査担当が監査ログを閲覧できる
 * UC-09: 監査担当が監査ログをCSVエクスポートできる
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AuditAction,
  UserRole,
  AuditLogResponse,
  AuditLogFilter,
  PaginationParams,
  PaginatedResponse,
} from '@/lib/approvals/types';

// ============================================
// 監査ログ入力型
// ============================================

export interface AuditLogInput {
  requestId: string;
  action: AuditAction;
  actorId: string;
  actorRole: UserRole;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// 監査ログサービス
// ============================================

function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export class AuditLogger {
  private db: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.db = supabaseClient || createServerClient();
  }

  // ------------------------------------------
  // ログ記録 (UC-11, BR-03)
  // ------------------------------------------

  /**
   * 監査ログを記録
   * BR-03: INSERTのみ許可（UPDATE/DELETEはDB側でブロック）
   */
  async log(input: AuditLogInput): Promise<void> {
    const { error } = await this.db
      .schema('approval')
      .from('logs')
      .insert({
        request_id: input.requestId,
        action: input.action,
        actor_id: input.actorId,
        actor_role: input.actorRole,
        details: input.details || null,
        ip_address: input.ipAddress || null,
        user_agent: input.userAgent || null,
      });

    if (error) {
      console.error('Failed to write audit log:', error);
      throw new Error('監査ログの記録に失敗しました');
    }
  }

  // ------------------------------------------
  // ログ取得 (UC-08)
  // ------------------------------------------

  /**
   * 監査ログ一覧取得
   */
  async getAuditLogs(
    filter?: AuditLogFilter,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<AuditLogResponse>> {
    let query = this.db
      .schema('approval')
      .from('logs')
      .select(
        `
        id,
        request_id,
        action,
        actor_id,
        actor_role,
        details,
        ip_address,
        created_at,
        requests:request_id (title)
      `,
        { count: 'exact' }
      );

    // フィルター適用
    if (filter?.request_id) {
      query = query.eq('request_id', filter.request_id);
    }
    if (filter?.action) {
      query = query.eq('action', filter.action);
    }
    if (filter?.actor_id) {
      query = query.eq('actor_id', filter.actor_id);
    }
    if (filter?.from_date) {
      query = query.gte('created_at', filter.from_date);
    }
    if (filter?.to_date) {
      query = query.lte('created_at', filter.to_date);
    }

    // ページネーション
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // ユーザー情報取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actorIds = [...new Set((data || []).map((l: any) => l.actor_id))];
    const users = await this.getUsersByIds(actorIds);
    const userMap = new Map(users.map(u => [u.id, u]));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs: AuditLogResponse[] = (data || []).map((log: any) => ({
      id: log.id,
      request_id: log.request_id,
      request_title: log.requests?.title || '',
      action: log.action,
      actor: {
        id: log.actor_id,
        email: userMap.get(log.actor_id)?.email || '',
      },
      actor_role: log.actor_role,
      details: log.details,
      ip_address: log.ip_address,
      created_at: log.created_at,
    }));

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * 特定の稟議に関する監査ログ取得
   */
  async getLogsByRequestId(requestId: string): Promise<AuditLogResponse[]> {
    const { data } = await this.getAuditLogs(
      { request_id: requestId },
      { limit: 1000 }
    );
    return data;
  }

  // ------------------------------------------
  // CSVエクスポート (UC-09)
  // ------------------------------------------

  /**
   * 監査ログをCSV形式でエクスポート
   */
  async exportToCsv(filter?: AuditLogFilter): Promise<string> {
    // 全件取得（ページネーションなし）
    const { data } = await this.getAuditLogs(filter, { limit: 10000 });

    // CSVヘッダー
    const headers = [
      'ID',
      '稟議ID',
      '稟議タイトル',
      'アクション',
      '実行者ID',
      '実行者メール',
      '実行者役職',
      '詳細',
      'IPアドレス',
      '日時',
    ];

    // CSV行
    const rows = data.map(log => [
      log.id,
      log.request_id,
      this.escapeCsvField(log.request_title),
      this.translateAction(log.action),
      log.actor.id,
      log.actor.email,
      this.translateRole(log.actor_role),
      this.escapeCsvField(JSON.stringify(log.details || {})),
      log.ip_address || '',
      this.formatDateTime(log.created_at),
    ]);

    // CSV生成
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // BOM付きUTF-8
    return '\uFEFF' + csvContent;
  }

  // ------------------------------------------
  // ヘルパーメソッド
  // ------------------------------------------

  private async getUsersByIds(
    userIds: string[]
  ): Promise<Array<{ id: string; email: string }>> {
    if (userIds.length === 0) return [];

    const { data, error } = await this.db
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (error) throw error;
    return data || [];
  }

  private escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private translateAction(action: AuditAction): string {
    const translations: Record<AuditAction, string> = {
      create: '作成',
      update: '更新',
      submit: '申請',
      approve: '承認',
      reject: '却下',
      return: '差戻し',
      cancel: '取消',
      delete: '削除',
    };
    return translations[action] || action;
  }

  private translateRole(role: UserRole): string {
    const translations: Record<UserRole, string> = {
      employee: '社員',
      manager: '課長',
      director: '部長',
      executive: '役員',
      auditor: '監査担当',
      admin: '管理者',
    };
    return translations[role] || role;
  }

  private formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}

// ============================================
// シングルトンインスタンス
// ============================================

let loggerInstance: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
  if (!loggerInstance) {
    loggerInstance = new AuditLogger();
  }
  return loggerInstance;
}
