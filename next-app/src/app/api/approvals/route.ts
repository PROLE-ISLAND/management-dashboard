/**
 * 稟議一覧・作成 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * GET /api/approvals - 稟議一覧取得 (UC-03)
 * POST /api/approvals - 稟議新規作成 (UC-01)
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import {
  createApprovalSchema,
  approvalListFilterSchema,
  paginationSchema,
  validate,
} from '@/lib/approvals/validators';
import { ValidationError } from '@/lib/approvals/types';
import {
  getAuthUser,
  jsonResponse,
  errorResponse,
  getClientIp,
  getUserAgent,
  searchParamsToObject,
} from '@/lib/api-utils';

/**
 * GET /api/approvals
 * 自分の稟議一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const service = getApprovalService();

    // クエリパラメータ解析
    const params = searchParamsToObject(request.nextUrl.searchParams);

    const filterResult = validate(approvalListFilterSchema, params);
    const paginationResult = validate(paginationSchema, params);

    const result = await service.getApprovalsByRequester(
      user.id,
      filterResult.data,
      paginationResult.data
    );

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/approvals
 * 稟議を新規作成（下書き状態）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const service = getApprovalService();

    const body = await request.json();
    const validationResult = validate(createApprovalSchema, body);

    if (!validationResult.success) {
      throw new ValidationError('入力内容に誤りがあります', validationResult.errors);
    }

    const result = await service.createApproval(
      validationResult.data!,
      user.id,
      getClientIp(request),
      getUserAgent(request)
    );

    return jsonResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
