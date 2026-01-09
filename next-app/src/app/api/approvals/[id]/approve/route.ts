/**
 * 承認 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * POST /api/approvals/:id/approve - 稟議承認 (UC-05)
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import { uuidSchema, approveSchema, validate } from '@/lib/approvals/validators';
import { ValidationError } from '@/lib/approvals/types';
import {
  getAuthUser,
  jsonResponse,
  errorResponse,
  getClientIp,
  getUserAgent,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/approvals/:id/approve
 * 稟議を承認
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    const service = getApprovalService();

    // ID バリデーション
    const idResult = validate(uuidSchema, id);
    if (!idResult.success) {
      throw new ValidationError('無効な稟議IDです');
    }

    // ボディ解析
    let body = {};
    try {
      body = await request.json();
    } catch {
      // 空ボディを許容
    }

    const validationResult = validate(approveSchema, body);
    if (!validationResult.success) {
      throw new ValidationError('入力内容に誤りがあります', validationResult.errors);
    }

    const result = await service.approveStep(
      id,
      validationResult.data!,
      user.id,
      getClientIp(request),
      getUserAgent(request)
    );

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
