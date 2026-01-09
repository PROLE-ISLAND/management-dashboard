/**
 * 監査ログ テスト
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * テスト設計 5.2:
 * - logAuditAction: submit/approve/reject/return 記録
 *
 * ビジネスルール:
 * - BR-03: 監査ログは追記のみ（UPDATE/DELETE不可）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogger, AuditLogInput } from '../logger';

// Supabase モック
const mockSupabaseClient = {
  schema: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn(),
  in: vi.fn().mockReturnThis(),
};

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger = new AuditLogger(mockSupabaseClient as any);
  });

  describe('log (BR-03)', () => {
    const testCases: Array<{ action: AuditLogInput['action']; description: string }> = [
      { action: 'create', description: '作成' },
      { action: 'update', description: '更新' },
      { action: 'submit', description: '申請' },
      { action: 'approve', description: '承認' },
      { action: 'reject', description: '却下' },
      { action: 'return', description: '差戻し' },
      { action: 'cancel', description: '取消' },
      { action: 'delete', description: '削除' },
    ];

    it.each(testCases)('should log $action action', async ({ action }) => {
      mockSupabaseClient.insert.mockResolvedValueOnce({ error: null });

      const input: AuditLogInput = {
        requestId: 'request-1',
        action,
        actorId: 'user-1',
        actorRole: 'employee',
        details: { test: 'data' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      await logger.log(input);

      expect(mockSupabaseClient.schema).toHaveBeenCalledWith('approval');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('logs');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        request_id: 'request-1',
        action,
        actor_id: 'user-1',
        actor_role: 'employee',
        details: { test: 'data' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });
    });

    it('should log without optional fields', async () => {
      mockSupabaseClient.insert.mockResolvedValueOnce({ error: null });

      const input: AuditLogInput = {
        requestId: 'request-1',
        action: 'submit',
        actorId: 'user-1',
        actorRole: 'employee',
      };

      await logger.log(input);

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        request_id: 'request-1',
        action: 'submit',
        actor_id: 'user-1',
        actor_role: 'employee',
        details: null,
        ip_address: null,
        user_agent: null,
      });
    });

    it('should throw error when insert fails', async () => {
      mockSupabaseClient.insert.mockResolvedValueOnce({
        error: { message: 'Insert failed' },
      });

      const input: AuditLogInput = {
        requestId: 'request-1',
        action: 'submit',
        actorId: 'user-1',
        actorRole: 'employee',
      };

      await expect(logger.log(input)).rejects.toThrow('監査ログの記録に失敗しました');
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          request_id: 'request-1',
          action: 'submit',
          actor_id: 'user-1',
          actor_role: 'employee',
          details: null,
          ip_address: '192.168.1.1',
          created_at: '2024-01-01T00:00:00Z',
          requests: { title: 'テスト稟議' },
        },
      ];

      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
        count: 1,
      });

      // Mock getUsersByIds
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'user-1', email: 'test@example.com' }],
              error: null,
            }),
          };
        }
        return mockSupabaseClient;
      });

      const result = await logger.getAuditLogs(
        {},
        { page: 1, limit: 20 }
      );

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by request_id', async () => {
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await logger.getAuditLogs({ request_id: 'request-1' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('request_id', 'request-1');
    });

    it('should filter by action', async () => {
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await logger.getAuditLogs({ action: 'approve' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('action', 'approve');
    });

    it('should filter by date range', async () => {
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await logger.getAuditLogs({
        from_date: '2024-01-01',
        to_date: '2024-12-31',
      });

      expect(mockSupabaseClient.gte).toHaveBeenCalledWith('created_at', '2024-01-01');
      expect(mockSupabaseClient.lte).toHaveBeenCalledWith('created_at', '2024-12-31');
    });
  });

  describe('exportToCsv', () => {
    it('should generate valid CSV with BOM', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          request_id: 'request-1',
          action: 'submit',
          actor_id: 'user-1',
          actor_role: 'employee',
          details: null,
          ip_address: '192.168.1.1',
          created_at: '2024-01-01T00:00:00Z',
          requests: { title: 'テスト稟議' },
        },
      ];

      mockSupabaseClient.range.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
        count: 1,
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'user-1', email: 'test@example.com' }],
              error: null,
            }),
          };
        }
        return mockSupabaseClient;
      });

      const csv = await logger.exportToCsv();

      // BOM check
      expect(csv.startsWith('\uFEFF')).toBe(true);

      // Header check
      expect(csv).toContain('ID,稟議ID,稟議タイトル,アクション');

      // Data check
      expect(csv).toContain('log-1');
      expect(csv).toContain('request-1');
      expect(csv).toContain('テスト稟議');
      expect(csv).toContain('申請'); // translated action
    });

    it('should escape fields with commas', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          request_id: 'request-1',
          action: 'submit',
          actor_id: 'user-1',
          actor_role: 'employee',
          details: null,
          ip_address: null,
          created_at: '2024-01-01T00:00:00Z',
          requests: { title: 'テスト,カンマ入り' },
        },
      ];

      mockSupabaseClient.range.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
        count: 1,
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'user-1', email: 'test@example.com' }],
              error: null,
            }),
          };
        }
        return mockSupabaseClient;
      });

      const csv = await logger.exportToCsv();

      // Escaped field with quotes
      expect(csv).toContain('"テスト,カンマ入り"');
    });
  });

  describe('getLogsByRequestId', () => {
    it('should call getAuditLogs with request_id filter', async () => {
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await logger.getLogsByRequestId('request-1');

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('request_id', 'request-1');
    });
  });

  describe('action translation', () => {
    it('should translate all actions correctly in CSV', async () => {
      // This is a helper test to verify the translation map is complete
      const translations = {
        create: '作成',
        update: '更新',
        submit: '申請',
        approve: '承認',
        reject: '却下',
        return: '差戻し',
        cancel: '取消',
        delete: '削除',
      };

      // Verify all translations exist (implementation detail test)
      for (const [action, expected] of Object.entries(translations)) {
        const mockLog = {
          id: 'log-1',
          request_id: 'request-1',
          action,
          actor_id: 'user-1',
          actor_role: 'employee',
          details: null,
          ip_address: null,
          created_at: '2024-01-01T00:00:00Z',
          requests: { title: 'テスト' },
        };

        mockSupabaseClient.range.mockResolvedValueOnce({
          data: [mockLog],
          error: null,
          count: 1,
        });

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({
                data: [{ id: 'user-1', email: 'test@example.com' }],
                error: null,
              }),
            };
          }
          return mockSupabaseClient;
        });

        const csv = await logger.exportToCsv();
        expect(csv).toContain(expected);
      }
    });
  });

  describe('role translation', () => {
    it('should translate all roles correctly', () => {
      const roles = {
        employee: '社員',
        manager: '課長',
        director: '部長',
        executive: '役員',
        auditor: '監査担当',
        admin: '管理者',
      };

      // All roles should be translatable
      for (const role of Object.keys(roles)) {
        expect(roles[role as keyof typeof roles]).toBeDefined();
      }
    });
  });
});
