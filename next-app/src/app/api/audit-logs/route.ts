/**
 * 監査ログ一覧 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * GET /api/audit-logs - 監査ログ一覧取得 (UC-08)
 */

import { NextRequest } from 'next/server';
import { getAuditLogger } from '@/lib/audit/logger';
import { getApprovalRepository } from '@/lib/approvals/repository';
import {
  auditLogFilterSchema,
  paginationSchema,
  validate,
} from '@/lib/approvals/validators';
import { ForbiddenError } from '@/lib/approvals/types';
import {
  getAuthUser,
  jsonResponse,
  errorResponse,
  searchParamsToObject,
} from '@/lib/api-utils';

/**
 * GET /api/audit-logs
 * 監査ログ一覧を取得（監査担当・管理者のみ）
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
    const paginationResult = validate(paginationSchema, params);

    const result = await logger.getAuditLogs(
      filterResult.data,
      paginationResult.data
    );

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
