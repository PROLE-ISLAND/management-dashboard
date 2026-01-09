/**
 * 却下 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * POST /api/approvals/:id/reject - 稟議却下 (UC-06)
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import { uuidSchema, rejectSchema, validate } from '@/lib/approvals/validators';
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
 * POST /api/approvals/:id/reject
 * 稟議を却下
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

    const body = await request.json();
    const validationResult = validate(rejectSchema, body);

    if (!validationResult.success) {
      throw new ValidationError('却下理由は必須です', validationResult.errors);
    }

    const result = await service.rejectStep(
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
