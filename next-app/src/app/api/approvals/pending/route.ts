/**
 * 承認待ち一覧 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * GET /api/approvals/pending - 承認待ち一覧取得 (UC-04)
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import { paginationSchema, validate } from '@/lib/approvals/validators';
import {
  getAuthUser,
  jsonResponse,
  errorResponse,
  searchParamsToObject,
} from '@/lib/api-utils';

/**
 * GET /api/approvals/pending
 * 自分が承認者となっている承認待ち稟議一覧
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const service = getApprovalService();

    // クエリパラメータ解析
    const params = searchParamsToObject(request.nextUrl.searchParams);
    const paginationResult = validate(paginationSchema, params);

    const result = await service.getPendingApprovals(
      user.id,
      paginationResult.data
    );

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
