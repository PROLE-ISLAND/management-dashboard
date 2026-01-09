/**
 * IPO稟議ワークフロー - 承認ルート選択
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * BR-04: 金額に応じて承認ルートを自動選択
 * BR-08: 差戻し後の金額変更時はルート再選択
 */

import { ApprovalRepository, getApprovalRepository } from './repository';
import type { ApprovalRoute, ApprovalCategory } from './types';
import { NotFoundError } from './types';

// ============================================
// ルート選択サービス
// ============================================

export class RouteSelector {
  private repository: ApprovalRepository;

  constructor(repository?: ApprovalRepository) {
    this.repository = repository || getApprovalRepository();
  }

  /**
   * 金額とカテゴリに基づいて適切な承認ルートを選択
   * BR-04: 金額に応じて承認ルートを自動選択
   *
   * @param amount 申請金額
   * @param category カテゴリ（オプション）
   * @returns 選択された承認ルート
   * @throws NotFoundError 適用可能なルートがない場合
   */
  async selectRoute(amount: number, category?: ApprovalCategory): Promise<ApprovalRoute> {
    // カテゴリ指定がある場合、カテゴリ専用ルートを優先
    if (category) {
      const categoryRoute = await this.repository.findRouteByAmount(amount, category);
      if (categoryRoute) {
        return categoryRoute;
      }
    }

    // 汎用ルート（カテゴリNULL）を検索
    const generalRoute = await this.repository.findRouteByAmount(amount);

    if (!generalRoute) {
      throw new NotFoundError(
        `金額 ${amount.toLocaleString()}円 に適用可能な承認ルートがありません`
      );
    }

    return generalRoute;
  }

  /**
   * 金額変更時にルート再選択が必要かチェック
   * BR-08: 差戻し後の金額変更時はルート再選択
   *
   * @param currentRouteId 現在のルートID
   * @param newAmount 新しい金額
   * @param category カテゴリ
   * @returns 再選択が必要な場合true
   */
  async needsRouteReselection(
    currentRouteId: string,
    newAmount: number,
    category?: ApprovalCategory
  ): Promise<boolean> {
    const currentRoute = await this.repository.findRouteById(currentRouteId);
    if (!currentRoute) {
      return true; // ルートが見つからない場合は再選択必要
    }

    // 新しい金額が現在のルート範囲外かチェック
    if (newAmount < currentRoute.min_amount) {
      return true;
    }

    if (currentRoute.max_amount !== null && newAmount > currentRoute.max_amount) {
      return true;
    }

    // カテゴリが変更された場合
    if (category !== currentRoute.category) {
      // 新しい金額で正しいルートを取得
      const newRoute = await this.selectRoute(newAmount, category);
      return newRoute.id !== currentRouteId;
    }

    return false;
  }

  /**
   * 全承認ルートを取得（ルート一覧表示用）
   */
  async getAllRoutes(): Promise<ApprovalRoute[]> {
    return this.repository.findAllRoutes();
  }

  /**
   * 金額範囲の説明文を生成
   */
  formatAmountRange(route: ApprovalRoute): string {
    const min = route.min_amount.toLocaleString();

    if (route.max_amount === null) {
      return `${min}円以上`;
    }

    const max = route.max_amount.toLocaleString();
    if (route.min_amount === 0) {
      return `${max}円以下`;
    }

    return `${min}円〜${max}円`;
  }
}

// ============================================
// シングルトンインスタンス
// ============================================

let selectorInstance: RouteSelector | null = null;

export function getRouteSelector(): RouteSelector {
  if (!selectorInstance) {
    selectorInstance = new RouteSelector();
  }
  return selectorInstance;
}

// ============================================
// 標準ルート定義（参考）
// ============================================

/**
 * 標準ルートマスタ（DBに初期データとして投入）
 *
 * | ルート名 | 最小金額 | 最大金額 | カテゴリ |
 * |---------|---------|---------|---------|
 * | 課長承認 | 0 | 100,000 | NULL |
 * | 部長承認 | 100,001 | 500,000 | NULL |
 * | 役員承認 | 500,001 | 1,000,000 | NULL |
 * | 取締役会承認 | 1,000,001 | NULL | NULL |
 * | 契約課長承認 | 0 | 300,000 | contract |
 * | 契約部長承認 | 300,001 | 1,000,000 | contract |
 * | 契約役員承認 | 1,000,001 | NULL | contract |
 */
export const STANDARD_ROUTES = {
  // 汎用ルート
  MANAGER: { name: '課長承認', min: 0, max: 100000 },
  DIRECTOR: { name: '部長承認', min: 100001, max: 500000 },
  EXECUTIVE: { name: '役員承認', min: 500001, max: 1000000 },
  BOARD: { name: '取締役会承認', min: 1000001, max: null },

  // 契約専用ルート
  CONTRACT_MANAGER: { name: '契約課長承認', min: 0, max: 300000, category: 'contract' },
  CONTRACT_DIRECTOR: { name: '契約部長承認', min: 300001, max: 1000000, category: 'contract' },
  CONTRACT_EXECUTIVE: { name: '契約役員承認', min: 1000001, max: null, category: 'contract' },
} as const;

/**
 * 金額からルート名を推定（テスト・デバッグ用）
 */
export function estimateRouteName(amount: number, category?: ApprovalCategory): string {
  if (category === 'contract') {
    if (amount <= 300000) return STANDARD_ROUTES.CONTRACT_MANAGER.name;
    if (amount <= 1000000) return STANDARD_ROUTES.CONTRACT_DIRECTOR.name;
    return STANDARD_ROUTES.CONTRACT_EXECUTIVE.name;
  }

  if (amount <= 100000) return STANDARD_ROUTES.MANAGER.name;
  if (amount <= 500000) return STANDARD_ROUTES.DIRECTOR.name;
  if (amount <= 1000000) return STANDARD_ROUTES.EXECUTIVE.name;
  return STANDARD_ROUTES.BOARD.name;
}
