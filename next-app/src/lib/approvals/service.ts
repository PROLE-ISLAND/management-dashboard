/**
 * IPO稟議ワークフロー - サービス層
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * ビジネスルール:
 * - BR-01: 申請者は自分の稟議を承認できない（職務分離）
 * - BR-02: 承認済み稟議は編集不可
 * - BR-03: 監査ログは追記のみ（UPDATE/DELETE不可）
 * - BR-04: 金額に応じて承認ルートを自動選択
 * - BR-05: 並列承認グループは required_count 分の承認で次へ
 * - BR-06: 代理承認は委任期間内かつ金額上限以下の場合のみ有効
 * - BR-07: 却下された稟議は再申請可能（新規稟議として作成）
 * - BR-08: 差戻し後は下書き状態に戻り、金額変更時はルート再選択
 */

import { ApprovalRepository, getApprovalRepository } from './repository';
import { RouteSelector, getRouteSelector } from './route-selector';
import { AuditLogger, getAuditLogger } from '@/lib/audit/logger';
import type {
  ApprovalRequest,
  ApprovalResponse,
  ApprovalListItem,
  ActionResponse,
  CreateApprovalInput,
  UpdateApprovalInput,
  ApproveInput,
  RejectInput,
  ReturnInput,
  ApprovalCategory,
  UserRole,
  PaginationParams,
  ApprovalListFilter,
  PaginatedResponse,
  StepInfo,
  UserInfo,
} from './types';
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from './types';

// ============================================
// 稟議サービス
// ============================================

export class ApprovalService {
  private repository: ApprovalRepository;
  private routeSelector: RouteSelector;
  private auditLogger: AuditLogger;

  constructor(
    repository?: ApprovalRepository,
    routeSelector?: RouteSelector,
    auditLogger?: AuditLogger
  ) {
    this.repository = repository || getApprovalRepository();
    this.routeSelector = routeSelector || getRouteSelector();
    this.auditLogger = auditLogger || getAuditLogger();
  }

  // ------------------------------------------
  // 稟議作成 (UC-01)
  // ------------------------------------------

  async createApproval(
    input: CreateApprovalInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ApprovalResponse> {
    // ルート選択 (BR-04)
    const route = await this.routeSelector.selectRoute(input.amount, input.category);

    // 稟議作成
    const request = await this.repository.create({
      title: input.title,
      description: input.description,
      amount: input.amount,
      category: input.category,
      requester_id: userId,
      route_id: route.id,
    });

    // 監査ログ記録 (BR-03)
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: request.id,
      action: 'create',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { title: input.title, amount: input.amount },
      ipAddress,
      userAgent,
    });

    return this.buildApprovalResponse(request);
  }

  // ------------------------------------------
  // 稟議更新 (下書きのみ)
  // ------------------------------------------

  async updateApproval(
    id: string,
    input: UpdateApprovalInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ApprovalResponse> {
    const request = await this.getRequestOrThrow(id);

    // 申請者チェック
    if (request.requester_id !== userId) {
      throw new ForbiddenError('自分の稟議のみ編集できます');
    }

    // 下書きチェック (BR-02)
    if (request.status !== 'draft') {
      throw new ConflictError('下書き状態の稟議のみ編集できます');
    }

    // 金額変更時のルート再選択 (BR-08)
    let routeId = request.route_id;
    if (input.amount !== undefined && input.amount !== request.amount) {
      const needsReselection = await this.routeSelector.needsRouteReselection(
        request.route_id,
        input.amount,
        input.category || (request.category as ApprovalCategory | undefined)
      );

      if (needsReselection) {
        const newRoute = await this.routeSelector.selectRoute(
          input.amount,
          input.category || (request.category as ApprovalCategory | undefined)
        );
        routeId = newRoute.id;
      }
    }

    const updated = await this.repository.update(id, {
      ...input,
      ...(routeId !== request.route_id ? { route_id: routeId } : {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // 監査ログ
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: id,
      action: 'update',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { changes: input },
      ipAddress,
      userAgent,
    });

    return this.buildApprovalResponse(updated);
  }

  // ------------------------------------------
  // 稟議削除 (下書きのみ)
  // ------------------------------------------

  async deleteApproval(
    id: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const request = await this.getRequestOrThrow(id);

    // 申請者チェック
    if (request.requester_id !== userId) {
      throw new ForbiddenError('自分の稟議のみ削除できます');
    }

    // 下書きチェック
    if (request.status !== 'draft') {
      throw new ConflictError('下書き状態の稟議のみ削除できます');
    }

    // 監査ログ
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: id,
      action: 'delete',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { title: request.title },
      ipAddress,
      userAgent,
    });

    await this.repository.delete(id);
  }

  // ------------------------------------------
  // 稟議申請 (UC-02)
  // ------------------------------------------

  async submitApproval(
    id: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActionResponse> {
    const request = await this.getRequestOrThrow(id);

    // 申請者チェック
    if (request.requester_id !== userId) {
      throw new ForbiddenError('自分の稟議のみ申請できます');
    }

    // 下書きチェック
    if (request.status !== 'draft') {
      throw new ConflictError('下書き状態の稟議のみ申請できます');
    }

    // ルート再選択（金額が変更されている可能性）
    const route = await this.routeSelector.selectRoute(
      request.amount,
      request.category as ApprovalCategory | undefined
    );

    // 承認ステップ作成（ルートに基づいて）
    // TODO: ルートごとの承認者定義をDBから取得
    // 暫定: 仮の承認ステップを作成
    await this.createApprovalSteps(id, route.id);

    // ステータス更新
    const updated = await this.repository.updateStatus(id, 'pending', {
      route_id: route.id,
      submitted_at: new Date().toISOString(),
    });

    // 監査ログ
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: id,
      action: 'submit',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { route_name: route.name },
      ipAddress,
      userAgent,
    });

    const response = await this.buildApprovalResponse(updated);
    const nextStep = await this.getNextStepInfo(id);

    return {
      success: true,
      request: response,
      next_step: nextStep,
    };
  }

  // ------------------------------------------
  // 承認 (UC-05)
  // ------------------------------------------

  async approveStep(
    id: string,
    input: ApproveInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActionResponse> {
    const request = await this.getRequestOrThrow(id);

    // 承認中チェック
    if (request.status !== 'pending') {
      throw new ConflictError('承認中の稟議のみ承認できます');
    }

    // 職務分離チェック (BR-01)
    this.validateSeparationOfDuties(request.requester_id, userId);

    // 承認権限チェック（代理承認含む）
    const step = await this.getApproverStepOrThrow(id, userId, request.amount);

    // 承認実行
    await this.repository.updateStepStatus(step.id, 'approved', input.comment);

    // グループ承認チェック (BR-05)
    const { completed, nextGroup } = await this.checkGroupApproval(id, step.step_group);

    let updated = request;
    if (completed && nextGroup === null) {
      // 最終承認完了
      updated = await this.repository.updateStatus(id, 'approved', {
        completed_at: new Date().toISOString(),
      });
    }

    // 監査ログ
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: id,
      action: 'approve',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { comment: input.comment, step_group: step.step_group },
      ipAddress,
      userAgent,
    });

    const response = await this.buildApprovalResponse(updated);
    const nextStep = nextGroup !== null ? await this.getNextStepInfo(id) : undefined;

    return {
      success: true,
      request: response,
      next_step: nextStep,
    };
  }

  // ------------------------------------------
  // 代理承認 (BR-06)
  // ------------------------------------------

  async approveByDelegate(
    id: string,
    input: ApproveInput,
    delegateId: string,
    delegatorId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActionResponse> {
    const request = await this.getRequestOrThrow(id);

    // 承認中チェック
    if (request.status !== 'pending') {
      throw new ConflictError('承認中の稟議のみ承認できます');
    }

    // 職務分離チェック（代理者と申請者）
    this.validateSeparationOfDuties(request.requester_id, delegateId);

    // 代理承認権限チェック (BR-06)
    const delegation = await this.repository.findActiveDelegation(
      delegatorId,
      delegateId,
      request.amount
    );

    if (!delegation) {
      throw new ForbiddenError(
        '有効な代理承認権限がありません（期間外または金額超過）'
      );
    }

    // 委任者のステップを取得
    const step = await this.repository.findStepByRequestAndApprover(id, delegatorId);
    if (!step) {
      throw new ForbiddenError('委任者に承認権限がありません');
    }

    // 承認実行
    await this.repository.updateStepStatus(step.id, 'approved', input.comment);

    // グループ承認チェック
    const { completed, nextGroup } = await this.checkGroupApproval(id, step.step_group);

    let updated = request;
    if (completed && nextGroup === null) {
      updated = await this.repository.updateStatus(id, 'approved', {
        completed_at: new Date().toISOString(),
      });
    }

    // 監査ログ（代理承認として記録）
    const userRoles = await this.repository.findUserRoles(delegateId);
    await this.auditLogger.log({
      requestId: id,
      action: 'approve',
      actorId: delegateId,
      actorRole: userRoles[0] || 'employee',
      details: {
        comment: input.comment,
        step_group: step.step_group,
        delegated_from: delegatorId,
      },
      ipAddress,
      userAgent,
    });

    const response = await this.buildApprovalResponse(updated);
    const nextStep = nextGroup !== null ? await this.getNextStepInfo(id) : undefined;

    return {
      success: true,
      request: response,
      next_step: nextStep,
    };
  }

  // ------------------------------------------
  // 却下 (UC-06)
  // ------------------------------------------

  async rejectStep(
    id: string,
    input: RejectInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActionResponse> {
    const request = await this.getRequestOrThrow(id);

    // 承認中チェック
    if (request.status !== 'pending') {
      throw new ConflictError('承認中の稟議のみ却下できます');
    }

    // 職務分離チェック (BR-01)
    this.validateSeparationOfDuties(request.requester_id, userId);

    // 承認権限チェック
    const step = await this.getApproverStepOrThrow(id, userId, request.amount);

    // 却下実行
    await this.repository.updateStepStatus(step.id, 'rejected', input.comment);

    // 稟議を却下状態に
    const updated = await this.repository.updateStatus(id, 'rejected', {
      completed_at: new Date().toISOString(),
    });

    // 残りのステップをスキップ
    const steps = await this.repository.findStepsByRequestId(id);
    for (const s of steps) {
      if (s.status === 'pending') {
        await this.repository.updateStepStatus(s.id, 'skipped');
      }
    }

    // 監査ログ
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: id,
      action: 'reject',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { comment: input.comment, step_group: step.step_group },
      ipAddress,
      userAgent,
    });

    const response = await this.buildApprovalResponse(updated);

    return {
      success: true,
      request: response,
    };
  }

  // ------------------------------------------
  // 差戻し (UC-07, BR-08)
  // ------------------------------------------

  async returnStep(
    id: string,
    input: ReturnInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActionResponse> {
    const request = await this.getRequestOrThrow(id);

    // 承認中チェック
    if (request.status !== 'pending') {
      throw new ConflictError('承認中の稟議のみ差戻しできます');
    }

    // 職務分離チェック (BR-01)
    this.validateSeparationOfDuties(request.requester_id, userId);

    // 承認権限チェック
    const step = await this.getApproverStepOrThrow(id, userId, request.amount);

    // 差戻し実行 - 下書き状態に戻す (BR-08)
    const updated = await this.repository.updateStatus(id, 'draft', {
      submitted_at: null,
    });

    // 全ステップをリセット
    const steps = await this.repository.findStepsByRequestId(id);
    for (const s of steps) {
      await this.repository.updateStepStatus(s.id, 'pending');
    }

    // 監査ログ
    const userRoles = await this.repository.findUserRoles(userId);
    await this.auditLogger.log({
      requestId: id,
      action: 'return',
      actorId: userId,
      actorRole: userRoles[0] || 'employee',
      details: { comment: input.comment, step_group: step.step_group },
      ipAddress,
      userAgent,
    });

    const response = await this.buildApprovalResponse(updated);

    return {
      success: true,
      request: response,
    };
  }

  // ------------------------------------------
  // 稟議一覧取得 (UC-03)
  // ------------------------------------------

  async getApprovalsByRequester(
    userId: string,
    filter?: ApprovalListFilter,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ApprovalListItem>> {
    const { data, total } = await this.repository.findByRequester(userId, filter, pagination);

    const items = await Promise.all(
      data.map(r => this.buildApprovalListItem(r))
    );

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  // ------------------------------------------
  // 承認待ち一覧取得 (UC-04)
  // ------------------------------------------

  async getPendingApprovals(
    userId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ApprovalListItem>> {
    const { data, total } = await this.repository.findPendingForApprover(userId, pagination);

    const items = await Promise.all(
      data.map(r => this.buildApprovalListItem(r))
    );

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  // ------------------------------------------
  // 稟議詳細取得
  // ------------------------------------------

  async getApprovalById(
    id: string,
    userId: string
  ): Promise<ApprovalResponse> {
    const request = await this.getRequestOrThrow(id);

    // 閲覧権限チェック
    const canView = await this.canViewApproval(request, userId);
    if (!canView) {
      throw new ForbiddenError('この稟議を閲覧する権限がありません');
    }

    return this.buildApprovalResponse(request);
  }

  // ------------------------------------------
  // 全稟議取得（監査用）
  // ------------------------------------------

  async getAllApprovals(
    userId: string,
    filter?: ApprovalListFilter,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ApprovalListItem>> {
    // 監査担当または管理者チェック
    const isAuditor = await this.repository.hasRole(userId, 'auditor');
    const isAdmin = await this.repository.hasRole(userId, 'admin');

    if (!isAuditor && !isAdmin) {
      throw new ForbiddenError('監査担当または管理者のみ全稟議を閲覧できます');
    }

    const { data, total } = await this.repository.findAll(filter, pagination);

    const items = await Promise.all(
      data.map(r => this.buildApprovalListItem(r))
    );

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  // ------------------------------------------
  // ヘルパーメソッド
  // ------------------------------------------

  private async getRequestOrThrow(id: string): Promise<ApprovalRequest> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundError('稟議が見つかりません');
    }
    return request;
  }

  /**
   * 職務分離チェック (BR-01)
   */
  private validateSeparationOfDuties(requesterId: string, approverId: string): void {
    if (requesterId === approverId) {
      throw new ForbiddenError('申請者自身は承認できません');
    }
  }

  /**
   * 承認者のステップを取得（代理承認も考慮）
   */
  private async getApproverStepOrThrow(
    requestId: string,
    userId: string,
    amount: number
  ): Promise<{ id: string; step_group: number }> {
    // 直接の承認権限
    let step = await this.repository.findStepByRequestAndApprover(requestId, userId);

    if (!step) {
      // 代理承認権限をチェック
      const delegations = await this.repository.findDelegationsForDelegate(userId);

      for (const delegation of delegations) {
        // 金額上限チェック
        if (delegation.max_amount !== null && amount > delegation.max_amount) {
          continue;
        }

        const delegatorStep = await this.repository.findStepByRequestAndApprover(
          requestId,
          delegation.delegator_id
        );

        if (delegatorStep) {
          step = delegatorStep;
          break;
        }
      }
    }

    if (!step) {
      throw new ForbiddenError('この稟議を承認する権限がありません');
    }

    return { id: step.id, step_group: step.step_group };
  }

  /**
   * グループ承認チェック (BR-05)
   */
  private async checkGroupApproval(
    requestId: string,
    stepGroup: number
  ): Promise<{ completed: boolean; nextGroup: number | null }> {
    const stats = await this.repository.getGroupApprovalStats(requestId, stepGroup);

    if (stats.approved_count >= stats.required_count) {
      // 残りをスキップ
      await this.repository.updateStepStatusByGroup(requestId, stepGroup, 'skipped');

      // 次グループ確認
      const nextGroup = await this.repository.getNextStepGroup(requestId, stepGroup);
      return { completed: true, nextGroup };
    }

    return { completed: false, nextGroup: null };
  }

  /**
   * 閲覧権限チェック
   */
  private async canViewApproval(request: ApprovalRequest, userId: string): Promise<boolean> {
    // 申請者
    if (request.requester_id === userId) return true;

    // 監査担当・管理者
    if (await this.repository.hasRole(userId, 'auditor')) return true;
    if (await this.repository.hasRole(userId, 'admin')) return true;

    // 承認者（pending状態のみ）
    if (request.status === 'pending') {
      const step = await this.repository.findStepByRequestAndApprover(request.id, userId);
      if (step) return true;
    }

    return false;
  }

  /**
   * 承認ステップ作成（申請時）
   */
  private async createApprovalSteps(requestId: string, routeId: string): Promise<void> {
    // TODO: ルートに基づいた承認者定義をDBから取得
    // 現時点では仮のステップを作成
    // 実際の実装ではroute_stepsテーブルなどから承認者を取得

    // 仮実装: 単一の承認ステップ
    // 本番では route_id に基づいて承認者を動的に設定
  }

  /**
   * 次の承認ステップ情報取得
   */
  private async getNextStepInfo(
    requestId: string
  ): Promise<{ group: number; approvers: Array<UserInfo & { role: UserRole }> } | undefined> {
    const currentGroup = await this.repository.getCurrentStepGroup(requestId);
    if (currentGroup === null) return undefined;

    const steps = await this.repository.findStepsByRequestId(requestId);
    const groupSteps = steps.filter(s => s.step_group === currentGroup && s.status === 'pending');

    const approverIds = groupSteps.map(s => s.approver_id);
    const users = await this.repository.findUsersByIds(approverIds);

    const userMap = new Map(users.map(u => [u.id, u]));

    return {
      group: currentGroup,
      approvers: groupSteps.map(s => ({
        id: s.approver_id,
        email: userMap.get(s.approver_id)?.email || '',
        role: s.approver_role,
      })),
    };
  }

  /**
   * ApprovalResponseを構築
   */
  private async buildApprovalResponse(request: ApprovalRequest): Promise<ApprovalResponse> {
    const [route, steps, attachments, requester] = await Promise.all([
      this.repository.findRouteById(request.route_id),
      this.repository.findStepsByRequestId(request.id),
      this.repository.findAttachmentsByRequestId(request.id),
      this.repository.findUserById(request.requester_id),
    ]);

    const approverIds = steps.map(s => s.approver_id);
    const uploaderIds = attachments.map(a => a.uploaded_by);
    const allUserIds = [...new Set([...approverIds, ...uploaderIds])];
    const users = await this.repository.findUsersByIds(allUserIds);
    const userMap = new Map(users.map(u => [u.id, u]));

    const currentStepGroup = await this.repository.getCurrentStepGroup(request.id);

    return {
      id: request.id,
      title: request.title,
      description: request.description,
      amount: request.amount,
      category: request.category,
      status: request.status,
      requester: {
        id: request.requester_id,
        email: requester?.email || '',
      },
      route: {
        id: request.route_id,
        name: route?.name || '',
      },
      current_step_group: currentStepGroup,
      steps: steps.map(s => ({
        id: s.id,
        step_order: s.step_order,
        step_group: s.step_group,
        approver: {
          id: s.approver_id,
          email: userMap.get(s.approver_id)?.email || '',
        },
        approver_role: s.approver_role,
        status: s.status,
        required_count: s.required_count,
        comment: s.comment,
        acted_at: s.acted_at,
      })),
      attachments: attachments.map(a => ({
        id: a.id,
        file_name: a.file_name,
        file_size: a.file_size,
        mime_type: a.mime_type,
        uploaded_by: {
          id: a.uploaded_by,
          email: userMap.get(a.uploaded_by)?.email || '',
        },
        description: a.description,
        created_at: a.created_at,
      })),
      submitted_at: request.submitted_at,
      completed_at: request.completed_at,
      created_at: request.created_at,
      updated_at: request.updated_at,
    };
  }

  /**
   * ApprovalListItemを構築
   */
  private async buildApprovalListItem(request: ApprovalRequest): Promise<ApprovalListItem> {
    const [route, requester] = await Promise.all([
      this.repository.findRouteById(request.route_id),
      this.repository.findUserById(request.requester_id),
    ]);

    const currentStepGroup = await this.repository.getCurrentStepGroup(request.id);

    return {
      id: request.id,
      title: request.title,
      amount: request.amount,
      category: request.category,
      status: request.status,
      requester: {
        id: request.requester_id,
        email: requester?.email || '',
      },
      route: {
        id: request.route_id,
        name: route?.name || '',
      },
      current_step_group: currentStepGroup,
      submitted_at: request.submitted_at,
      created_at: request.created_at,
    };
  }
}

// ============================================
// シングルトンインスタンス
// ============================================

let serviceInstance: ApprovalService | null = null;

export function getApprovalService(): ApprovalService {
  if (!serviceInstance) {
    serviceInstance = new ApprovalService();
  }
  return serviceInstance;
}
