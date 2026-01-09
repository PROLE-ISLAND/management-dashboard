/**
 * API共通ユーティリティ
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AppError, UnauthorizedError, ErrorResponse } from '@/lib/approvals/types';

// ============================================
// 認証ユーティリティ
// ============================================

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * リクエストから認証ユーザーを取得
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('認証トークンが必要です');
  }

  const token = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('無効な認証トークンです');
  }

  return {
    id: user.id,
    email: user.email || '',
  };
}

// ============================================
// レスポンスユーティリティ
// ============================================

/**
 * 成功レスポンス
 */
export function jsonResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * エラーレスポンス
 */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    const body: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return NextResponse.json(body, { status: error.statusCode });
  }

  console.error('Unexpected error:', error);

  const body: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'サーバー内部エラーが発生しました',
    },
  };
  return NextResponse.json(body, { status: 500 });
}

// ============================================
// リクエストユーティリティ
// ============================================

/**
 * クライアントIPアドレスを取得
 */
export function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * User-Agentを取得
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * URLSearchParamsをオブジェクトに変換
 */
export function searchParamsToObject(
  searchParams: URLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
