/**
 * 稟議詳細・更新・削除 API
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 *
 * GET /api/approvals/:id - 稟議詳細取得
 * PUT /api/approvals/:id - 稟議更新（下書きのみ）
 * DELETE /api/approvals/:id - 稟議削除（下書きのみ）
 */

import { NextRequest } from 'next/server';
import { getApprovalService } from '@/lib/approvals/service';
import {
  updateApprovalSchema,
  uuidSchema,
  validate,
} from '@/lib/approvals/validators';
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
 * GET /api/approvals/:id
 * 稟議詳細を取得
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    const service = getApprovalService();

    // ID バリデーション
    const idResult = validate(uuidSchema, id);
    if (!idResult.success) {
      throw new ValidationError('無効な稟議IDです');
    }

    const result = await service.getApprovalById(id, user.id);

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/approvals/:id
 * 稟議を更新（下書きのみ）
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validationResult = validate(updateApprovalSchema, body);

    if (!validationResult.success) {
      throw new ValidationError('入力内容に誤りがあります', validationResult.errors);
    }

    const result = await service.updateApproval(
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

/**
 * DELETE /api/approvals/:id
 * 稟議を削除（下書きのみ）
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    const service = getApprovalService();

    // ID バリデーション
    const idResult = validate(uuidSchema, id);
    if (!idResult.success) {
      throw new ValidationError('無効な稟議IDです');
    }

    await service.deleteApproval(
      id,
      user.id,
      getClientIp(request),
      getUserAgent(request)
    );

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
