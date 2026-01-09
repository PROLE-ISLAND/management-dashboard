/**
 * 差戻し API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * POST /api/approvals/:id/return - 稟議差戻し (UC-07, BR-08)
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import { uuidSchema, returnSchema, validate } from '@/lib/approvals/validators';
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
 * POST /api/approvals/:id/return
 * 稟議を差戻し（下書き状態に戻す）
 * BR-08: 差戻し後は下書き状態に戻り、金額変更時はルート再選択
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
    const validationResult = validate(returnSchema, body);

    if (!validationResult.success) {
      throw new ValidationError('差戻し理由は必須です', validationResult.errors);
    }

    const result = await service.returnStep(
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
