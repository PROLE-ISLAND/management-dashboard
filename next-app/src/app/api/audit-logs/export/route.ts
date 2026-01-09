/**
 * 監査ログCSVエクスポート API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * GET /api/audit-logs/export - 監査ログCSVエクスポート (UC-09)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogger } from '@/lib/audit/logger';
import { getApprovalRepository } from '@/lib/approvals/repository';
import { auditLogFilterSchema, validate } from '@/lib/approvals/validators';
import { ForbiddenError } from '@/lib/approvals/types';
import {
  getAuthUser,
  errorResponse,
  searchParamsToObject,
} from '@/lib/api-utils';

/**
 * GET /api/audit-logs/export
 * 監査ログをCSVとしてエクスポート（監査担当・管理者のみ）
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const repository = getApprovalRepository();
    const logger = getAuditLogger();

    // 監査担当または管理者チェック
    const isAuditor = await repository.hasRole(user.id, 'auditor');
    const isAdmin = await repository.hasRole(user.id, 'admin');

    if (!isAuditor && !isAdmin) {
      throw new ForbiddenError('監査担当または管理者のみアクセスできます');
    }

    // クエリパラメータ解析
    const params = searchParamsToObject(request.nextUrl.searchParams);
    const filterResult = validate(auditLogFilterSchema, params);

    const csvContent = await logger.exportToCsv(filterResult.data);

    // ファイル名生成
    const now = new Date();
    const filename = `audit_logs_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
