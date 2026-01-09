/**
 * 承認ルート選択 テスト
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * テスト設計 5.2:
 * - selectRoute: 10万円→課長、50万円→部長、100万円→役員、1000万円→取締役会
 * - 境界値: 100000, 100001, 500000, 500001
 * - カテゴリ別ルート選択（contract）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteSelector, estimateRouteName, STANDARD_ROUTES } from '../route-selector';
import { ApprovalRepository } from '../repository';
import type { ApprovalRoute, ApprovalCategory } from '../types';

// モック用のルートデータ
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
  {
    id: 'route-3',
    name: '役員承認',
    min_amount: 500001,
    max_amount: 1000000,
    category: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'route-4',
    name: '取締役会承認',
    min_amount: 1000001,
    max_amount: null,
    category: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'route-contract-1',
    name: '契約課長承認',
    min_amount: 0,
    max_amount: 300000,
    category: 'contract' as ApprovalCategory,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'route-contract-2',
    name: '契約部長承認',
    min_amount: 300001,
    max_amount: 1000000,
    category: 'contract' as ApprovalCategory,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'route-contract-3',
    name: '契約役員承認',
    min_amount: 1000001,
    max_amount: null,
    category: 'contract' as ApprovalCategory,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('RouteSelector', () => {
  let selector: RouteSelector;
  let mockRepository: Partial<ApprovalRepository>;

  beforeEach(() => {
    // Repository モック
    mockRepository = {
      findRouteByAmount: vi.fn().mockImplementation((amount: number, category?: string) => {
        const routes = category
          ? mockRoutes.filter(r => r.category === category)
          : mockRoutes.filter(r => r.category === null);

        return routes.find(
          r =>
            amount >= r.min_amount &&
            (r.max_amount === null || amount <= r.max_amount)
        ) || null;
      }),
      findRouteById: vi.fn().mockImplementation((id: string) => {
        return mockRoutes.find(r => r.id === id) || null;
      }),
      findAllRoutes: vi.fn().mockResolvedValue(mockRoutes),
    };

    selector = new RouteSelector(mockRepository as ApprovalRepository);
  });

  describe('selectRoute', () => {
    // BR-04: 金額に応じて承認ルートを自動選択

    it('should select 課長承認 for 10万円', async () => {
      const route = await selector.selectRoute(100000);
      expect(route.name).toBe('課長承認');
    });

    it('should select 部長承認 for 50万円', async () => {
      const route = await selector.selectRoute(500000);
      expect(route.name).toBe('部長承認');
    });

    it('should select 役員承認 for 100万円', async () => {
      const route = await selector.selectRoute(1000000);
      expect(route.name).toBe('役員承認');
    });

    it('should select 取締役会承認 for 1000万円', async () => {
      const route = await selector.selectRoute(10000000);
      expect(route.name).toBe('取締役会承認');
    });

    // 境界値テスト
    describe('boundary values', () => {
      it('should select 課長承認 for exactly 100000', async () => {
        const route = await selector.selectRoute(100000);
        expect(route.name).toBe('課長承認');
      });

      it('should select 部長承認 for 100001', async () => {
        const route = await selector.selectRoute(100001);
        expect(route.name).toBe('部長承認');
      });

      it('should select 部長承認 for exactly 500000', async () => {
        const route = await selector.selectRoute(500000);
        expect(route.name).toBe('部長承認');
      });

      it('should select 役員承認 for 500001', async () => {
        const route = await selector.selectRoute(500001);
        expect(route.name).toBe('役員承認');
      });

      it('should select 役員承認 for exactly 1000000', async () => {
        const route = await selector.selectRoute(1000000);
        expect(route.name).toBe('役員承認');
      });

      it('should select 取締役会承認 for 1000001', async () => {
        const route = await selector.selectRoute(1000001);
        expect(route.name).toBe('取締役会承認');
      });

      it('should select 課長承認 for 0円', async () => {
        const route = await selector.selectRoute(0);
        expect(route.name).toBe('課長承認');
      });
    });

    // カテゴリ別ルート
    describe('category-specific routes', () => {
      it('should select 契約課長承認 for contract under 30万', async () => {
        const route = await selector.selectRoute(300000, 'contract');
        expect(route.name).toBe('契約課長承認');
      });

      it('should select 契約部長承認 for contract 300001', async () => {
        const route = await selector.selectRoute(300001, 'contract');
        expect(route.name).toBe('契約部長承認');
      });

      it('should select 契約役員承認 for contract over 100万', async () => {
        const route = await selector.selectRoute(1000001, 'contract');
        expect(route.name).toBe('契約役員承認');
      });
    });

    it('should throw NotFoundError when no route matches', async () => {
      mockRepository.findRouteByAmount = vi.fn().mockResolvedValue(null);

      await expect(selector.selectRoute(100000))
        .rejects.toThrow('適用可能な承認ルートがありません');
    });
  });

  describe('needsRouteReselection', () => {
    // BR-08: 差戻し後の金額変更時はルート再選択

    it('should return false when amount stays in range', async () => {
      const needs = await selector.needsRouteReselection('route-1', 50000);
      expect(needs).toBe(false);
    });

    it('should return true when amount drops below min', async () => {
      const needs = await selector.needsRouteReselection('route-2', 50000);
      expect(needs).toBe(true);
    });

    it('should return true when amount exceeds max', async () => {
      const needs = await selector.needsRouteReselection('route-1', 200000);
      expect(needs).toBe(true);
    });

    it('should return true when route not found', async () => {
      mockRepository.findRouteById = vi.fn().mockResolvedValue(null);
      const needs = await selector.needsRouteReselection('invalid-route', 50000);
      expect(needs).toBe(true);
    });
  });

  describe('formatAmountRange', () => {
    it('should format range with min and max', () => {
      const route: ApprovalRoute = {
        id: '1',
        name: 'Test',
        min_amount: 100001,
        max_amount: 500000,
        category: null,
        is_active: true,
        created_at: '',
        updated_at: '',
      };

      const formatted = selector.formatAmountRange(route);
      expect(formatted).toBe('100,001円〜500,000円');
    });

    it('should format range with no max', () => {
      const route: ApprovalRoute = {
        id: '1',
        name: 'Test',
        min_amount: 1000001,
        max_amount: null,
        category: null,
        is_active: true,
        created_at: '',
        updated_at: '',
      };

      const formatted = selector.formatAmountRange(route);
      expect(formatted).toBe('1,000,001円以上');
    });

    it('should format range starting from 0', () => {
      const route: ApprovalRoute = {
        id: '1',
        name: 'Test',
        min_amount: 0,
        max_amount: 100000,
        category: null,
        is_active: true,
        created_at: '',
        updated_at: '',
      };

      const formatted = selector.formatAmountRange(route);
      expect(formatted).toBe('100,000円以下');
    });
  });
});

describe('estimateRouteName (utility)', () => {
  it('should estimate route name for general amounts', () => {
    expect(estimateRouteName(50000)).toBe('課長承認');
    expect(estimateRouteName(100000)).toBe('課長承認');
    expect(estimateRouteName(100001)).toBe('部長承認');
    expect(estimateRouteName(500000)).toBe('部長承認');
    expect(estimateRouteName(500001)).toBe('役員承認');
    expect(estimateRouteName(1000000)).toBe('役員承認');
    expect(estimateRouteName(1000001)).toBe('取締役会承認');
  });

  it('should estimate route name for contract category', () => {
    expect(estimateRouteName(100000, 'contract')).toBe('契約課長承認');
    expect(estimateRouteName(300000, 'contract')).toBe('契約課長承認');
    expect(estimateRouteName(300001, 'contract')).toBe('契約部長承認');
    expect(estimateRouteName(1000000, 'contract')).toBe('契約部長承認');
    expect(estimateRouteName(1000001, 'contract')).toBe('契約役員承認');
  });
});

describe('STANDARD_ROUTES constant', () => {
  it('should have correct manager route', () => {
    expect(STANDARD_ROUTES.MANAGER.min).toBe(0);
    expect(STANDARD_ROUTES.MANAGER.max).toBe(100000);
  });

  it('should have correct director route', () => {
    expect(STANDARD_ROUTES.DIRECTOR.min).toBe(100001);
    expect(STANDARD_ROUTES.DIRECTOR.max).toBe(500000);
  });

  it('should have correct executive route', () => {
    expect(STANDARD_ROUTES.EXECUTIVE.min).toBe(500001);
    expect(STANDARD_ROUTES.EXECUTIVE.max).toBe(1000000);
  });

  it('should have correct board route with no max', () => {
    expect(STANDARD_ROUTES.BOARD.min).toBe(1000001);
    expect(STANDARD_ROUTES.BOARD.max).toBeNull();
  });
});
