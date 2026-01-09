/**
 * 稟議申請 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * POST /api/approvals/:id/submit - 稟議申請 (UC-02)
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import { uuidSchema, validate } from '@/lib/approvals/validators';
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
 * POST /api/approvals/:id/submit
 * 下書き状態の稟議を申請
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

    const result = await service.submitApproval(
      id,
      user.id,
      getClientIp(request),
      getUserAgent(request)
    );

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
