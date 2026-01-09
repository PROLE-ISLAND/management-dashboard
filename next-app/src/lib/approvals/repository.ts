/**
 * IPO稟議ワークフロー - リポジトリ層
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  ApprovalRequest,
  ApprovalStep,
  ApprovalRoute,
  ApprovalDelegation,
  ApprovalAttachment,
  ApprovalLog,
  UserRoleAssignment,
  ApprovalStatus,
  StepStatus,
  ApprovalCategory,
  AuditAction,
  UserRole,
  PaginationParams,
  ApprovalListFilter,
  AuditLogFilter,
} from './types';

// ============================================
// Supabase クライアント（サーバーサイド用）
// ============================================

function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================
// 稟議申請リポジトリ
// ============================================

export interface CreateRequestData {
  title: string;
  description?: string;
  amount: number;
  category?: ApprovalCategory;
  requester_id: string;
  route_id: string;
}

export interface UpdateRequestData {
  title?: string;
  description?: string;
  amount?: number;
  category?: ApprovalCategory;
}

export class ApprovalRepository {
  private db: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.db = supabaseClient || createServerClient();
  }

  // ------------------------------------------
  // 稟議申請 CRUD
  // ------------------------------------------

  async findById(id: string): Promise<ApprovalRequest | null> {
    const { data, error } = await this.db
      .schema('approval')
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async findByRequester(
    requesterId: string,
    filter?: ApprovalListFilter,
    pagination?: PaginationParams
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    let query = this.db
      .schema('approval')
      .from('requests')
      .select('*', { count: 'exact' })
      .eq('requester_id', requesterId);

    query = this.applyFilters(query, filter);
    query = this.applyPagination(query, pagination);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findPendingForApprover(
    approverId: string,
    pagination?: PaginationParams
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    // サブクエリでapproverに割り当てられたpending稟議を取得
    const { data: stepData, error: stepError } = await this.db
      .schema('approval')
      .from('steps')
      .select('request_id')
      .eq('approver_id', approverId)
      .eq('status', 'pending');

    if (stepError) throw stepError;

    const requestIds = stepData?.map(s => s.request_id) || [];
    if (requestIds.length === 0) {
      return { data: [], total: 0 };
    }

    let query = this.db
      .schema('approval')
      .from('requests')
      .select('*', { count: 'exact' })
      .in('id', requestIds)
      .eq('status', 'pending');

    query = this.applyPagination(query, pagination);
    query = query.order('submitted_at', { ascending: true });

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findAll(
    filter?: ApprovalListFilter,
    pagination?: PaginationParams
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    let query = this.db
      .schema('approval')
      .from('requests')
      .select('*', { count: 'exact' });

    query = this.applyFilters(query, filter);
    query = this.applyPagination(query, pagination);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async create(data: CreateRequestData): Promise<ApprovalRequest> {
    const { data: created, error } = await this.db
      .schema('approval')
      .from('requests')
      .insert({
        title: data.title,
        description: data.description || null,
        amount: data.amount,
        category: data.category || null,
        requester_id: data.requester_id,
        route_id: data.route_id,
        status: 'draft' as ApprovalStatus,
      })
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async update(id: string, data: UpdateRequestData): Promise<ApprovalRequest> {
    const { data: updated, error } = await this.db
      .schema('approval')
      .from('requests')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async updateStatus(
    id: string,
    status: ApprovalStatus,
    additionalFields?: Partial<ApprovalRequest>
  ): Promise<ApprovalRequest> {
    const { data: updated, error } = await this.db
      .schema('approval')
      .from('requests')
      .update({
        status,
        ...additionalFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .schema('approval')
      .from('requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ------------------------------------------
  // 承認ステップ
  // ------------------------------------------

  async findStepsByRequestId(requestId: string): Promise<ApprovalStep[]> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .select('*')
      .eq('request_id', requestId)
      .order('step_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findStepByRequestAndApprover(
    requestId: string,
    approverId: string
  ): Promise<ApprovalStep | null> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .select('*')
      .eq('request_id', requestId)
      .eq('approver_id', approverId)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createSteps(steps: Array<Omit<ApprovalStep, 'id' | 'created_at' | 'updated_at'>>): Promise<ApprovalStep[]> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .insert(steps)
      .select();

    if (error) throw error;
    return data || [];
  }

  async updateStepStatus(
    stepId: string,
    status: StepStatus,
    comment?: string
  ): Promise<ApprovalStep> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .update({
        status,
        comment: comment || null,
        acted_at: status !== 'pending' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStepStatusByGroup(
    requestId: string,
    stepGroup: number,
    status: StepStatus
  ): Promise<void> {
    const { error } = await this.db
      .schema('approval')
      .from('steps')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('request_id', requestId)
      .eq('step_group', stepGroup)
      .eq('status', 'pending');

    if (error) throw error;
  }

  async getGroupApprovalStats(
    requestId: string,
    stepGroup: number
  ): Promise<{ required_count: number; approved_count: number; pending_count: number }> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .select('status, required_count')
      .eq('request_id', requestId)
      .eq('step_group', stepGroup);

    if (error) throw error;

    const steps = data || [];
    const requiredCount = steps[0]?.required_count || 1;
    const approvedCount = steps.filter(s => s.status === 'approved').length;
    const pendingCount = steps.filter(s => s.status === 'pending').length;

    return {
      required_count: requiredCount,
      approved_count: approvedCount,
      pending_count: pendingCount,
    };
  }

  async getNextStepGroup(requestId: string, currentGroup: number): Promise<number | null> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .select('step_group')
      .eq('request_id', requestId)
      .gt('step_group', currentGroup)
      .order('step_group', { ascending: true })
      .limit(1);

    if (error) throw error;
    return data?.[0]?.step_group ?? null;
  }

  async getCurrentStepGroup(requestId: string): Promise<number | null> {
    const { data, error } = await this.db
      .schema('approval')
      .from('steps')
      .select('step_group')
      .eq('request_id', requestId)
      .eq('status', 'pending')
      .order('step_group', { ascending: true })
      .limit(1);

    if (error) throw error;
    return data?.[0]?.step_group ?? null;
  }

  // ------------------------------------------
  // 承認ルート
  // ------------------------------------------

  async findRouteById(id: string): Promise<ApprovalRoute | null> {
    const { data, error } = await this.db
      .schema('approval')
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findRouteByAmount(amount: number, category?: ApprovalCategory): Promise<ApprovalRoute | null> {
    let query = this.db
      .schema('approval')
      .from('routes')
      .select('*')
      .eq('is_active', true)
      .lte('min_amount', amount);

    // max_amountがNULLまたは金額以上
    query = query.or(`max_amount.is.null,max_amount.gte.${amount}`);

    // カテゴリフィルター
    if (category) {
      query = query.or(`category.eq.${category},category.is.null`);
    } else {
      query = query.is('category', null);
    }

    query = query
      .order('category', { ascending: false, nullsFirst: false })
      .order('min_amount', { ascending: false })
      .limit(1);

    const { data, error } = await query;
    if (error) throw error;
    return data?.[0] ?? null;
  }

  async findAllRoutes(): Promise<ApprovalRoute[]> {
    const { data, error } = await this.db
      .schema('approval')
      .from('routes')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // ------------------------------------------
  // 代理承認
  // ------------------------------------------

  async findActiveDelegation(
    delegatorId: string,
    delegateId: string,
    amount: number
  ): Promise<ApprovalDelegation | null> {
    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await this.db
      .schema('approval')
      .from('delegations')
      .select('*')
      .eq('delegator_id', delegatorId)
      .eq('delegate_id', delegateId)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .or(`max_amount.is.null,max_amount.gte.${amount}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findDelegationsForDelegate(delegateId: string): Promise<ApprovalDelegation[]> {
    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await this.db
      .schema('approval')
      .from('delegations')
      .select('*')
      .eq('delegate_id', delegateId)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);

    if (error) throw error;
    return data || [];
  }

  // ------------------------------------------
  // ユーザー役職
  // ------------------------------------------

  async findUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await this.db
      .schema('approval')
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(r => r.role as UserRole);
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roles = await this.findUserRoles(userId);
    return roles.includes(role);
  }

  // ------------------------------------------
  // 添付ファイル
  // ------------------------------------------

  async findAttachmentsByRequestId(requestId: string): Promise<ApprovalAttachment[]> {
    const { data, error } = await this.db
      .schema('approval')
      .from('attachments')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // ------------------------------------------
  // ユーザー情報取得
  // ------------------------------------------

  async findUserById(userId: string): Promise<{ id: string; email: string } | null> {
    const { data, error } = await this.db
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findUsersByIds(userIds: string[]): Promise<Array<{ id: string; email: string }>> {
    if (userIds.length === 0) return [];

    const { data, error } = await this.db
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (error) throw error;
    return data || [];
  }

  // ------------------------------------------
  // ヘルパーメソッド
  // ------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filter?: ApprovalListFilter): any {
    if (!filter) return query;

    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.requester_id) {
      query = query.eq('requester_id', filter.requester_id);
    }
    if (filter.from_date) {
      query = query.gte('created_at', filter.from_date);
    }
    if (filter.to_date) {
      query = query.lte('created_at', filter.to_date);
    }

    return query;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyPagination(query: any, pagination?: PaginationParams): any {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    return query.range(offset, offset + limit - 1);
  }
}

// ============================================
// シングルトンインスタンス
// ============================================

let repositoryInstance: ApprovalRepository | null = null;

export function getApprovalRepository(): ApprovalRepository {
  if (!repositoryInstance) {
    repositoryInstance = new ApprovalRepository();
  }
  return repositoryInstance;
}
