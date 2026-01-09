/**
 * サービス層 テスト
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * テスト設計 5.2:
 * - createApproval: 正常作成、バリデーションエラー
 * - submitApproval: 下書きから申請、承認中は申請不可
 * - approveStep: 正常承認、職務分離違反、二重承認防止
 * - approveByDelegate: 代理承認（期間内/外、金額上限内/超過）
 * - returnStep: 差戻し→下書き状態
 * - rejectStep: 却下→rejected状態
 *
 * ビジネスルール:
 * - BR-01: 職務分離
 * - BR-02: 承認済み編集不可
 * - BR-05: 並列承認
 * - BR-06: 代理承認検証
 * - BR-07: 却下後再申請
 * - BR-08: 差戻し後編集
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApprovalService } from '../service';
import { ApprovalRepository } from '../repository';
import { RouteSelector } from '../route-selector';
import { AuditLogger } from '@/lib/audit/logger';
import type { ApprovalRequest, ApprovalRoute, ApprovalStep, ApprovalDelegation } from '../types';
import { ForbiddenError, ConflictError, NotFoundError } from '../types';

// モックデータ
const mockRoute: ApprovalRoute = {
  id: 'route-1',
  name: '課長承認',
  min_amount: 0,
  max_amount: 100000,
  category: null,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockDraftRequest: ApprovalRequest = {
  id: 'request-1',
  title: 'テスト稟議',
  description: 'テスト',
  amount: 50000,
  category: null,
  requester_id: 'user-1',
  route_id: 'route-1',
  status: 'draft',
  submitted_at: null,
  completed_at: null,
  linked_cost_order_id: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockPendingRequest: ApprovalRequest = {
  ...mockDraftRequest,
  id: 'request-2',
  status: 'pending',
  submitted_at: '2024-01-02',
};

const mockStep: ApprovalStep = {
  id: 'step-1',
  request_id: 'request-2',
  step_order: 1,
  step_group: 1,
  approver_id: 'user-2',
  approver_role: 'manager',
  status: 'pending',
  required_count: 1,
  comment: null,
  acted_at: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockDelegation: ApprovalDelegation = {
  id: 'delegation-1',
  delegator_id: 'user-2',
  delegate_id: 'user-3',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  max_amount: 100000,
  reason: 'テスト',
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('ApprovalService', () => {
  let service: ApprovalService;
  let mockRepository: Partial<ApprovalRepository>;
  let mockRouteSelector: Partial<RouteSelector>;
  let mockAuditLogger: Partial<AuditLogger>;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByRequester: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      findStepsByRequestId: vi.fn().mockResolvedValue([]),
      findStepByRequestAndApprover: vi.fn(),
      createSteps: vi.fn(),
      updateStepStatus: vi.fn(),
      updateStepStatusByGroup: vi.fn(),
      getGroupApprovalStats: vi.fn(),
      getNextStepGroup: vi.fn(),
      getCurrentStepGroup: vi.fn().mockResolvedValue(null),
      findRouteById: vi.fn().mockResolvedValue(mockRoute),
      findUserRoles: vi.fn().mockResolvedValue(['employee']),
      findUserById: vi.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
      findUsersByIds: vi.fn().mockResolvedValue([]),
      findAttachmentsByRequestId: vi.fn().mockResolvedValue([]),
      findActiveDelegation: vi.fn(),
      findDelegationsForDelegate: vi.fn().mockResolvedValue([]),
      hasRole: vi.fn().mockResolvedValue(false),
    };

    mockRouteSelector = {
      selectRoute: vi.fn().mockResolvedValue(mockRoute),
      needsRouteReselection: vi.fn().mockResolvedValue(false),
    };

    mockAuditLogger = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new ApprovalService(
      mockRepository as ApprovalRepository,
      mockRouteSelector as RouteSelector,
      mockAuditLogger as AuditLogger
    );
  });

  describe('createApproval (UC-01)', () => {
    it('should create approval with draft status', async () => {
      mockRepository.create = vi.fn().mockResolvedValue(mockDraftRequest);

      const result = await service.createApproval(
        { title: 'テスト', amount: 50000 },
        'user-1'
      );

      expect(result.status).toBe('draft');
      expect(mockRouteSelector.selectRoute).toHaveBeenCalledWith(50000, undefined);
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          actorId: 'user-1',
        })
      );
    });

    it('should select route based on amount and category', async () => {
      mockRepository.create = vi.fn().mockResolvedValue(mockDraftRequest);

      await service.createApproval(
        { title: 'テスト', amount: 500000, category: 'contract' },
        'user-1'
      );

      expect(mockRouteSelector.selectRoute).toHaveBeenCalledWith(500000, 'contract');
    });
  });

  describe('updateApproval (BR-02)', () => {
    it('should update draft approval', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.update = vi.fn().mockResolvedValue({ ...mockDraftRequest, title: '更新後' });

      const result = await service.updateApproval(
        'request-1',
        { title: '更新後' },
        'user-1'
      );

      expect(result.title).toBe('更新後');
    });

    it('should reject update of non-draft approval (BR-02)', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);

      await expect(
        service.updateApproval('request-2', { title: '更新後' }, 'user-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should reject update by non-owner', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);

      await expect(
        service.updateApproval('request-1', { title: '更新後' }, 'user-other')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should trigger route reselection when amount changes (BR-08)', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRouteSelector.needsRouteReselection = vi.fn().mockResolvedValue(true);
      mockRouteSelector.selectRoute = vi.fn().mockResolvedValue({ ...mockRoute, id: 'route-2' });
      mockRepository.update = vi.fn().mockResolvedValue(mockDraftRequest);

      await service.updateApproval(
        'request-1',
        { amount: 200000 },
        'user-1'
      );

      expect(mockRouteSelector.needsRouteReselection).toHaveBeenCalled();
      expect(mockRouteSelector.selectRoute).toHaveBeenCalledWith(200000, null);
    });
  });

  describe('deleteApproval', () => {
    it('should delete draft approval', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.delete = vi.fn().mockResolvedValue(undefined);

      await service.deleteApproval('request-1', 'user-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('request-1');
    });

    it('should reject delete of non-draft approval', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);

      await expect(
        service.deleteApproval('request-2', 'user-1')
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('submitApproval (UC-02)', () => {
    it('should submit draft approval', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockDraftRequest,
        status: 'pending',
        submitted_at: '2024-01-02',
      });

      const result = await service.submitApproval('request-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('pending');
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'submit' })
      );
    });

    it('should reject submit of non-draft approval', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);

      await expect(
        service.submitApproval('request-2', 'user-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should reject submit by non-owner', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);

      await expect(
        service.submitApproval('request-1', 'user-other')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('approveStep (UC-05, BR-01)', () => {
    it('should approve pending step', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue({ ...mockStep, status: 'approved' });
      mockRepository.getGroupApprovalStats = vi.fn().mockResolvedValue({
        required_count: 1,
        approved_count: 1,
        pending_count: 0,
      });
      mockRepository.getNextStepGroup = vi.fn().mockResolvedValue(null);
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockPendingRequest,
        status: 'approved',
        completed_at: '2024-01-02',
      });

      const result = await service.approveStep(
        'request-2',
        { comment: '承認' },
        'user-2'
      );

      expect(result.success).toBe(true);
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'approve' })
      );
    });

    it('should reject self-approval (BR-01 職務分離)', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);

      await expect(
        service.approveStep('request-2', {}, 'user-1') // requester_id === approver_id
      ).rejects.toThrow('申請者自身は承認できません');
    });

    it('should reject approval of non-pending request', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);

      await expect(
        service.approveStep('request-1', {}, 'user-2')
      ).rejects.toThrow(ConflictError);
    });

    it('should reject approval by non-approver', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(null);
      mockRepository.findDelegationsForDelegate = vi.fn().mockResolvedValue([]);

      await expect(
        service.approveStep('request-2', {}, 'user-3')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('approveByDelegate (BR-06)', () => {
    it('should allow delegate approval within period and amount', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findActiveDelegation = vi.fn().mockResolvedValue(mockDelegation);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue({ ...mockStep, status: 'approved' });
      mockRepository.getGroupApprovalStats = vi.fn().mockResolvedValue({
        required_count: 1,
        approved_count: 1,
        pending_count: 0,
      });
      mockRepository.getNextStepGroup = vi.fn().mockResolvedValue(null);
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockPendingRequest,
        status: 'approved',
      });

      const result = await service.approveByDelegate(
        'request-2',
        { comment: '代理承認' },
        'user-3', // delegate
        'user-2'  // delegator
      );

      expect(result.success).toBe(true);
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'approve',
          details: expect.objectContaining({ delegated_from: 'user-2' }),
        })
      );
    });

    it('should reject delegate approval outside period or amount', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findActiveDelegation = vi.fn().mockResolvedValue(null);

      await expect(
        service.approveByDelegate('request-2', {}, 'user-3', 'user-2')
      ).rejects.toThrow('有効な代理承認権限がありません');
    });

    it('should reject delegate self-approval (BR-01)', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);

      await expect(
        service.approveByDelegate('request-2', {}, 'user-1', 'user-2') // delegate === requester
      ).rejects.toThrow('申請者自身は承認できません');
    });
  });

  describe('rejectStep (UC-06)', () => {
    it('should reject request with comment', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue({ ...mockStep, status: 'rejected' });
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockPendingRequest,
        status: 'rejected',
        completed_at: '2024-01-02',
      });
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([mockStep]);

      const result = await service.rejectStep(
        'request-2',
        { comment: '予算超過' },
        'user-2'
      );

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('rejected');
    });

    it('should skip remaining steps on rejection', async () => {
      const pendingStep2: ApprovalStep = { ...mockStep, id: 'step-2', step_group: 2 };
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue({ ...mockStep, status: 'rejected' });
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockPendingRequest,
        status: 'rejected',
      });
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([
        { ...mockStep, status: 'rejected' },
        pendingStep2,
      ]);

      await service.rejectStep('request-2', { comment: '却下' }, 'user-2');

      expect(mockRepository.updateStepStatus).toHaveBeenCalledWith('step-2', 'skipped');
    });
  });

  describe('returnStep (UC-07, BR-08)', () => {
    it('should return request to draft status', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockPendingRequest,
        status: 'draft',
        submitted_at: null,
      });
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([mockStep]);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue(mockStep);

      const result = await service.returnStep(
        'request-2',
        { comment: '追加情報必要' },
        'user-2'
      );

      expect(result.success).toBe(true);
      expect(result.request.status).toBe('draft');
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'return' })
      );
    });

    it('should reset all steps to pending on return', async () => {
      const approvedStep: ApprovalStep = { ...mockStep, id: 'step-0', status: 'approved' };
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStatus = vi.fn().mockResolvedValue({
        ...mockPendingRequest,
        status: 'draft',
      });
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([approvedStep, mockStep]);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue(mockStep);

      await service.returnStep('request-2', { comment: '差戻し' }, 'user-2');

      expect(mockRepository.updateStepStatus).toHaveBeenCalledWith('step-0', 'pending');
      expect(mockRepository.updateStepStatus).toHaveBeenCalledWith('step-1', 'pending');
    });
  });

  describe('parallel approval (BR-05)', () => {
    it('should complete group when required_count is met', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue({ ...mockStep, status: 'approved' });
      mockRepository.getGroupApprovalStats = vi.fn().mockResolvedValue({
        required_count: 2,
        approved_count: 2,
        pending_count: 1,
      });
      mockRepository.getNextStepGroup = vi.fn().mockResolvedValue(2);
      mockRepository.updateStepStatusByGroup = vi.fn();
      mockRepository.getCurrentStepGroup = vi.fn().mockResolvedValue(2);

      const result = await service.approveStep('request-2', {}, 'user-2');

      expect(result.next_step?.group).toBe(2);
      expect(mockRepository.updateStepStatusByGroup).toHaveBeenCalledWith(
        'request-2',
        1,
        'skipped'
      );
    });

    it('should not complete group when required_count not met', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);
      mockRepository.updateStepStatus = vi.fn().mockResolvedValue({ ...mockStep, status: 'approved' });
      mockRepository.getGroupApprovalStats = vi.fn().mockResolvedValue({
        required_count: 2,
        approved_count: 1,
        pending_count: 1,
      });

      const result = await service.approveStep('request-2', {}, 'user-2');

      expect(result.success).toBe(true);
      expect(mockRepository.updateStepStatusByGroup).not.toHaveBeenCalled();
    });
  });

  describe('getRequestOrThrow', () => {
    it('should throw NotFoundError when request not found', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(
        service.getApprovalById('invalid-id', 'user-1')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getApprovalById (canViewApproval)', () => {
    it('should allow requester to view their own request', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findAttachmentsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findUsersByIds = vi.fn().mockResolvedValue([{ id: 'user-1', email: 'user1@example.com' }]);

      const result = await service.getApprovalById('request-1', 'user-1');

      expect(result.id).toBe('request-1');
    });

    it('should allow auditor to view any request', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findAttachmentsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findUsersByIds = vi.fn().mockResolvedValue([{ id: 'user-1', email: 'user1@example.com' }]);
      mockRepository.hasRole = vi.fn().mockResolvedValueOnce(true); // auditor

      const result = await service.getApprovalById('request-1', 'user-other');

      expect(result.id).toBe('request-1');
      expect(mockRepository.hasRole).toHaveBeenCalledWith('user-other', 'auditor');
    });

    it('should allow admin to view any request', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findAttachmentsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findUsersByIds = vi.fn().mockResolvedValue([{ id: 'user-1', email: 'user1@example.com' }]);
      mockRepository.hasRole = vi.fn()
        .mockResolvedValueOnce(false)  // not auditor
        .mockResolvedValueOnce(true);  // admin

      const result = await service.getApprovalById('request-1', 'user-other');

      expect(result.id).toBe('request-1');
    });

    it('should allow approver to view pending request', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockPendingRequest);
      mockRepository.findStepsByRequestId = vi.fn().mockResolvedValue([mockStep]);
      mockRepository.findAttachmentsByRequestId = vi.fn().mockResolvedValue([]);
      mockRepository.findUsersByIds = vi.fn().mockResolvedValue([
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ]);
      mockRepository.hasRole = vi.fn().mockResolvedValue(false);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(mockStep);

      const result = await service.getApprovalById('request-2', 'user-2');

      expect(result.id).toBe('request-2');
    });

    it('should reject view by unauthorized user', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(mockDraftRequest);
      mockRepository.hasRole = vi.fn().mockResolvedValue(false);
      mockRepository.findStepByRequestAndApprover = vi.fn().mockResolvedValue(null);

      await expect(
        service.getApprovalById('request-1', 'user-unauthorized')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getApprovalsByRequester', () => {
    it('should list approvals for requester', async () => {
      mockRepository.findByRequester = vi.fn().mockResolvedValue({ data: [mockDraftRequest], total: 1 });
      mockRepository.findRouteById = vi.fn().mockResolvedValue(mockRoute);
      mockRepository.findUserById = vi.fn().mockResolvedValue({ id: 'user-1', email: 'user1@example.com' });
      mockRepository.getCurrentStepGroup = vi.fn().mockResolvedValue(null);

      const result = await service.getApprovalsByRequester('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getPendingApprovals', () => {
    it('should list pending approvals for approver', async () => {
      mockRepository.findPendingForApprover = vi.fn().mockResolvedValue({ data: [mockPendingRequest], total: 1 });
      mockRepository.findRouteById = vi.fn().mockResolvedValue(mockRoute);
      mockRepository.findUserById = vi.fn().mockResolvedValue({ id: 'user-1', email: 'user1@example.com' });
      mockRepository.getCurrentStepGroup = vi.fn().mockResolvedValue(1);

      const result = await service.getPendingApprovals('user-2');

      expect(result.data).toHaveLength(1);
    });
  });
});
