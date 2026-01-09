/**
 * リポジトリ層 テスト
 * Issue: #7 feat(api): IPO稀議ワークフロー - API
 * Requirements PR: #11
 *
 * テスト設計 5.4:
 * - ApprovalRepository: CRUD操作、フィルタリング、ページネーション
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApprovalRepository } from '../repository';
import type { ApprovalRequest, ApprovalStep, ApprovalRoute, ApprovalDelegation, StepStatus } from '../types';

// Supabase モック - 再帰的チェーン対応
function createChainMock() {
  const mock = {
    schema: vi.fn(),
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    gt: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    is: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
  };

  // All methods return mock for chaining
  Object.keys(mock).forEach(key => {
    if (key !== 'then') {
      (mock as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mock);
    }
  });

  return mock;
}

// ヘルパー関数: ApprovalRequest モック作成
function createMockRequest(overrides: Partial<ApprovalRequest> = {}): ApprovalRequest {
  return {
    id: 'request-1',
    title: 'テスト申請',
    description: null,
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
    ...overrides,
  };
}

// ヘルパー関数: ApprovalStep モック作成
function createMockStep(overrides: Partial<ApprovalStep> = {}): ApprovalStep {
  return {
    id: 'step-1',
    request_id: 'request-1',
    approver_id: 'approver-1',
    approver_role: 'manager',
    step_order: 1,
    step_group: 1,
    required_count: 1,
    status: 'pending',
    comment: null,
    acted_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

// ヘルパー関数: ApprovalDelegation モック作成
function createMockDelegation(overrides: Partial<ApprovalDelegation> = {}): ApprovalDelegation {
  return {
    id: 'delegation-1',
    delegator_id: 'manager-1',
    delegate_id: 'deputy-1',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    max_amount: 500000,
    reason: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

describe('ApprovalRepository', () => {
  let repository: ApprovalRepository;
  let mockDb: ReturnType<typeof createChainMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createChainMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository = new ApprovalRepository(mockDb as any);
  });

  // ==========================================
  // 稀議申請 CRUD
  // ==========================================

  describe('findById', () => {
    it('should return request when found', async () => {
      const mockRequest = createMockRequest();

      mockDb.single.mockResolvedValueOnce({
        data: mockRequest,
        error: null,
      });

      const result = await repository.findById('request-1');

      expect(result).toEqual(mockRequest);
      expect(mockDb.schema).toHaveBeenCalledWith('approval');
      expect(mockDb.from).toHaveBeenCalledWith('requests');
      expect(mockDb.eq).toHaveBeenCalledWith('id', 'request-1');
    });

    it('should return null when not found', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error on database error', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'XXXXX', message: 'Database error' },
      });

      await expect(repository.findById('request-1')).rejects.toThrow();
    });
  });

  describe('findByRequester', () => {
    it('should return requests with pagination', async () => {
      const mockRequests: ApprovalRequest[] = [
        createMockRequest({ id: 'request-1', title: 'テスト申請1' }),
      ];

      mockDb.order.mockResolvedValueOnce({
        data: mockRequests,
        error: null,
        count: 1,
      });

      const result = await repository.findByRequester('user-1', {}, { page: 1, limit: 20 });

      expect(result.data).toEqual(mockRequests);
      expect(result.total).toBe(1);
      expect(mockDb.eq).toHaveBeenCalledWith('requester_id', 'user-1');
    });

    it('should apply filters', async () => {
      mockDb.order.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await repository.findByRequester(
        'user-1',
        { status: 'pending', category: 'expense' },
        { page: 1, limit: 10 }
      );

      expect(mockDb.eq).toHaveBeenCalledWith('status', 'pending');
      expect(mockDb.eq).toHaveBeenCalledWith('category', 'expense');
    });
  });

  describe('findPendingForApprover', () => {
    it('should return pending requests for approver', async () => {
      const mockSteps = [{ request_id: 'request-1' }, { request_id: 'request-2' }];
      const mockRequests: ApprovalRequest[] = [
        createMockRequest({ status: 'pending', submitted_at: '2024-01-01' }),
      ];

      mockDb.eq
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce({
          data: mockSteps,
          error: null,
        })
        .mockReturnValue(mockDb);

      mockDb.order.mockResolvedValueOnce({
        data: mockRequests,
        error: null,
        count: 1,
      });

      const result = await repository.findPendingForApprover('approver-1');

      expect(result.data).toEqual(mockRequests);
    });

    it('should return empty when no pending steps', async () => {
      mockDb.eq
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce({
          data: [],
          error: null,
        });

      const result = await repository.findPendingForApprover('approver-1');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all requests with filters', async () => {
      mockDb.order.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      const result = await repository.findAll(
        { status: 'approved' },
        { page: 1, limit: 20 }
      );

      expect(result.data).toEqual([]);
      expect(mockDb.eq).toHaveBeenCalledWith('status', 'approved');
    });

    it('should apply date filters', async () => {
      mockDb.order.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await repository.findAll({
        from_date: '2024-01-01',
        to_date: '2024-12-31',
      });

      expect(mockDb.gte).toHaveBeenCalledWith('created_at', '2024-01-01');
      expect(mockDb.lte).toHaveBeenCalledWith('created_at', '2024-12-31');
    });
  });

  describe('create', () => {
    it('should create a new request', async () => {
      const mockCreated = createMockRequest({
        id: 'new-request',
        title: '新規申請',
        description: '説明文',
        amount: 100000,
        category: 'expense',
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockCreated,
        error: null,
      });

      const result = await repository.create({
        title: '新規申請',
        description: '説明文',
        amount: 100000,
        category: 'expense',
        requester_id: 'user-1',
        route_id: 'route-1',
      });

      expect(result).toEqual(mockCreated);
      expect(mockDb.insert).toHaveBeenCalledWith({
        title: '新規申請',
        description: '説明文',
        amount: 100000,
        category: 'expense',
        requester_id: 'user-1',
        route_id: 'route-1',
        status: 'draft',
      });
    });

    it('should handle null optional fields', async () => {
      const mockCreated = createMockRequest({
        id: 'new-request',
        title: '新規申請',
        amount: 100000,
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockCreated,
        error: null,
      });

      await repository.create({
        title: '新規申請',
        amount: 100000,
        requester_id: 'user-1',
        route_id: 'route-1',
      });

      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
          category: null,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      const mockUpdated = createMockRequest({
        title: '更新されたタイトル',
        updated_at: '2024-01-02',
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockUpdated,
        error: null,
      });

      const result = await repository.update('request-1', { title: '更新されたタイトル' });

      expect(result.title).toBe('更新されたタイトル');
      expect(mockDb.eq).toHaveBeenCalledWith('id', 'request-1');
    });
  });

  describe('updateStatus', () => {
    it('should update status with additional fields', async () => {
      const mockUpdated = createMockRequest({
        status: 'pending',
        submitted_at: '2024-01-01T00:00:00Z',
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockUpdated,
        error: null,
      });

      const result = await repository.updateStatus('request-1', 'pending', {
        submitted_at: '2024-01-01T00:00:00Z',
      });

      expect(result.status).toBe('pending');
      expect(result.submitted_at).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('delete', () => {
    it('should delete a request', async () => {
      mockDb.eq.mockResolvedValueOnce({ error: null });

      await expect(repository.delete('request-1')).resolves.toBeUndefined();
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.eq).toHaveBeenCalledWith('id', 'request-1');
    });

    it('should throw on error', async () => {
      mockDb.eq.mockResolvedValueOnce({
        error: { message: 'Delete failed' },
      });

      await expect(repository.delete('request-1')).rejects.toThrow();
    });
  });

  // ==========================================
  // 承認ステップ
  // ==========================================

  describe('findStepsByRequestId', () => {
    it('should return steps ordered by step_order', async () => {
      const mockSteps: ApprovalStep[] = [
        createMockStep({ id: 'step-1', step_order: 1 }),
        createMockStep({ id: 'step-2', approver_id: 'approver-2', step_order: 2, step_group: 2 }),
      ];

      mockDb.order.mockResolvedValueOnce({
        data: mockSteps,
        error: null,
      });

      const result = await repository.findStepsByRequestId('request-1');

      expect(result).toHaveLength(2);
      expect(mockDb.eq).toHaveBeenCalledWith('request_id', 'request-1');
      expect(mockDb.order).toHaveBeenCalledWith('step_order', { ascending: true });
    });
  });

  describe('findStepByRequestAndApprover', () => {
    it('should return pending step for approver', async () => {
      const mockStep = createMockStep();

      mockDb.single.mockResolvedValueOnce({
        data: mockStep,
        error: null,
      });

      const result = await repository.findStepByRequestAndApprover('request-1', 'approver-1');

      expect(result).toEqual(mockStep);
      expect(mockDb.eq).toHaveBeenCalledWith('request_id', 'request-1');
      expect(mockDb.eq).toHaveBeenCalledWith('approver_id', 'approver-1');
      expect(mockDb.eq).toHaveBeenCalledWith('status', 'pending');
    });

    it('should return null when no pending step', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findStepByRequestAndApprover('request-1', 'approver-1');

      expect(result).toBeNull();
    });
  });

  describe('createSteps', () => {
    it('should create multiple steps', async () => {
      const stepsToCreate: Array<Omit<ApprovalStep, 'id' | 'created_at' | 'updated_at'>> = [
        {
          request_id: 'request-1',
          approver_id: 'approver-1',
          approver_role: 'manager',
          step_order: 1,
          step_group: 1,
          required_count: 1,
          status: 'pending' as StepStatus,
          comment: null,
          acted_at: null,
        },
        {
          request_id: 'request-1',
          approver_id: 'approver-2',
          approver_role: 'director',
          step_order: 2,
          step_group: 2,
          required_count: 1,
          status: 'pending' as StepStatus,
          comment: null,
          acted_at: null,
        },
      ];

      const mockCreated: ApprovalStep[] = stepsToCreate.map((s, i) => ({
        ...s,
        id: `step-${i + 1}`,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }));

      mockDb.select.mockResolvedValueOnce({
        data: mockCreated,
        error: null,
      });

      const result = await repository.createSteps(stepsToCreate);

      expect(result).toHaveLength(2);
      expect(mockDb.insert).toHaveBeenCalledWith(stepsToCreate);
    });
  });

  describe('updateStepStatus', () => {
    it('should update step status with comment', async () => {
      const mockUpdated = createMockStep({
        status: 'approved',
        comment: '承認します',
        acted_at: '2024-01-01T00:00:00Z',
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockUpdated,
        error: null,
      });

      const result = await repository.updateStepStatus('step-1', 'approved', '承認します');

      expect(result.status).toBe('approved');
      expect(result.comment).toBe('承認します');
    });

    it('should set acted_at to null when pending', async () => {
      const mockUpdated = createMockStep({ status: 'pending' });

      mockDb.single.mockResolvedValueOnce({
        data: mockUpdated,
        error: null,
      });

      await repository.updateStepStatus('step-1', 'pending');

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          acted_at: null,
        })
      );
    });
  });

  describe('getGroupApprovalStats', () => {
    it('should calculate approval stats for a group', async () => {
      const mockSteps = [
        { status: 'approved', required_count: 2 },
        { status: 'pending', required_count: 2 },
        { status: 'pending', required_count: 2 },
      ];

      mockDb.eq
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce({
          data: mockSteps,
          error: null,
        });

      const result = await repository.getGroupApprovalStats('request-1', 1);

      expect(result.required_count).toBe(2);
      expect(result.approved_count).toBe(1);
      expect(result.pending_count).toBe(2);
    });
  });

  describe('getNextStepGroup', () => {
    it('should return next step group number', async () => {
      mockDb.limit.mockResolvedValueOnce({
        data: [{ step_group: 2 }],
        error: null,
      });

      const result = await repository.getNextStepGroup('request-1', 1);

      expect(result).toBe(2);
      expect(mockDb.gt).toHaveBeenCalledWith('step_group', 1);
    });

    it('should return null when no next group', async () => {
      mockDb.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await repository.getNextStepGroup('request-1', 3);

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // 承認ルート
  // ==========================================

  describe('findRouteById', () => {
    it('should return route when found', async () => {
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

      mockDb.single.mockResolvedValueOnce({
        data: mockRoute,
        error: null,
      });

      const result = await repository.findRouteById('route-1');

      expect(result).toEqual(mockRoute);
    });
  });

  describe('findRouteByAmount', () => {
    it('should return route for amount without category', async () => {
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

      mockDb.limit.mockResolvedValueOnce({
        data: [mockRoute],
        error: null,
      });

      const result = await repository.findRouteByAmount(50000);

      expect(result).toEqual(mockRoute);
      expect(mockDb.lte).toHaveBeenCalledWith('min_amount', 50000);
      expect(mockDb.is).toHaveBeenCalledWith('category', null);
    });

    it('should return route for amount with category', async () => {
      const mockRoute: ApprovalRoute = {
        id: 'route-contract-1',
        name: '契約課長承認',
        min_amount: 0,
        max_amount: 300000,
        category: 'contract',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockDb.limit.mockResolvedValueOnce({
        data: [mockRoute],
        error: null,
      });

      const result = await repository.findRouteByAmount(200000, 'contract');

      expect(result).toEqual(mockRoute);
      expect(mockDb.or).toHaveBeenCalled();
    });

    it('should return null when no matching route', async () => {
      mockDb.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await repository.findRouteByAmount(999999999);

      expect(result).toBeNull();
    });
  });

  describe('findAllRoutes', () => {
    it('should return all active routes', async () => {
      const mockRoutes: ApprovalRoute[] = [
        {
          id: 'route-1',
          name: '課長承認',
          min_amount: 0,
          max_amount: 100000,
          category: null,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 'route-2',
          name: '部長承認',
          min_amount: 100001,
          max_amount: 500000,
          category: null,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      mockDb.order.mockResolvedValueOnce({
        data: mockRoutes,
        error: null,
      });

      const result = await repository.findAllRoutes();

      expect(result).toHaveLength(2);
      expect(mockDb.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  // ==========================================
  // 代理承認
  // ==========================================

  describe('findActiveDelegation', () => {
    it('should return active delegation', async () => {
      const mockDelegation = createMockDelegation();

      mockDb.single.mockResolvedValueOnce({
        data: mockDelegation,
        error: null,
      });

      const result = await repository.findActiveDelegation('manager-1', 'deputy-1', 100000);

      expect(result).toEqual(mockDelegation);
      expect(mockDb.eq).toHaveBeenCalledWith('delegator_id', 'manager-1');
      expect(mockDb.eq).toHaveBeenCalledWith('delegate_id', 'deputy-1');
      expect(mockDb.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should return null when delegation not found', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findActiveDelegation('manager-1', 'deputy-1', 100000);

      expect(result).toBeNull();
    });
  });

  describe('findDelegationsForDelegate', () => {
    it('should return all active delegations for delegate', async () => {
      const mockDelegations: ApprovalDelegation[] = [
        createMockDelegation(),
      ];

      mockDb.gte.mockResolvedValueOnce({
        data: mockDelegations,
        error: null,
      });

      const result = await repository.findDelegationsForDelegate('deputy-1');

      expect(result).toHaveLength(1);
      expect(mockDb.eq).toHaveBeenCalledWith('delegate_id', 'deputy-1');
    });
  });

  // ==========================================
  // ユーザー役職
  // ==========================================

  describe('findUserRoles', () => {
    it('should return user roles', async () => {
      mockDb.eq.mockResolvedValueOnce({
        data: [{ role: 'manager' }, { role: 'admin' }],
        error: null,
      });

      const result = await repository.findUserRoles('user-1');

      expect(result).toEqual(['manager', 'admin']);
    });

    it('should return empty array when no roles', async () => {
      mockDb.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await repository.findUserRoles('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', async () => {
      mockDb.eq.mockResolvedValueOnce({
        data: [{ role: 'manager' }],
        error: null,
      });

      const result = await repository.hasRole('user-1', 'manager');

      expect(result).toBe(true);
    });

    it('should return false when user does not have role', async () => {
      mockDb.eq.mockResolvedValueOnce({
        data: [{ role: 'employee' }],
        error: null,
      });

      const result = await repository.hasRole('user-1', 'admin');

      expect(result).toBe(false);
    });
  });

  // ==========================================
  // 添付ファイル
  // ==========================================

  describe('findAttachmentsByRequestId', () => {
    it('should return attachments ordered by created_at', async () => {
      const mockAttachments = [
        {
          id: 'attachment-1',
          request_id: 'request-1',
          filename: 'document.pdf',
          file_url: 'https://example.com/doc.pdf',
          file_size: 1024,
          mime_type: 'application/pdf',
          uploaded_by: 'user-1',
          created_at: '2024-01-01',
        },
      ];

      mockDb.order.mockResolvedValueOnce({
        data: mockAttachments,
        error: null,
      });

      const result = await repository.findAttachmentsByRequestId('request-1');

      expect(result).toHaveLength(1);
      expect(mockDb.eq).toHaveBeenCalledWith('request_id', 'request-1');
      expect(mockDb.order).toHaveBeenCalledWith('created_at', { ascending: true });
    });
  });

  // ==========================================
  // ユーザー情報取得
  // ==========================================

  describe('findUserById', () => {
    it('should return user when found', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: { id: 'user-1', email: 'test@example.com' },
        error: null,
      });

      const result = await repository.findUserById('user-1');

      expect(result).toEqual({ id: 'user-1', email: 'test@example.com' });
    });

    it('should return null when not found', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findUsersByIds', () => {
    it('should return users for given ids', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ];

      mockDb.in.mockResolvedValueOnce({
        data: mockUsers,
        error: null,
      });

      const result = await repository.findUsersByIds(['user-1', 'user-2']);

      expect(result).toHaveLength(2);
      expect(mockDb.in).toHaveBeenCalledWith('id', ['user-1', 'user-2']);
    });

    it('should return empty array for empty input', async () => {
      const result = await repository.findUsersByIds([]);

      expect(result).toEqual([]);
    });
  });
});
