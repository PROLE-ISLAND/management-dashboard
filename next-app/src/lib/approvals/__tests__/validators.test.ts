/**
 * バリデーション テスト
 * Issue: #7 feat(api): IPO稟議ワークフロー - API
 * Requirements PR: #11
 *
 * テスト設計 5.2: createApprovalSchema - 必須項目、文字数制限、金額範囲
 */

import { describe, it, expect } from 'vitest';
import {
  createApprovalSchema,
  updateApprovalSchema,
  approveSchema,
  rejectSchema,
  returnSchema,
  uuidSchema,
  paginationSchema,
  validate,
} from '../validators';

describe('validators', () => {
  describe('createApprovalSchema', () => {
    it('should accept valid input', () => {
      const input = {
        title: '出張費申請',
        description: '東京出張の交通費',
        amount: 50000,
        category: 'expense',
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
    });

    it('should accept input without optional fields', () => {
      const input = {
        title: '備品購入申請',
        amount: 10000,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const input = {
        title: '',
        amount: 10000,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toContain('タイトルは必須です');
    });

    it('should reject title over 200 characters', () => {
      const input = {
        title: 'あ'.repeat(201),
        amount: 10000,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toContain('タイトルは200文字以内で入力してください');
    });

    it('should reject description over 5000 characters', () => {
      const input = {
        title: '申請',
        description: 'あ'.repeat(5001),
        amount: 10000,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(false);
      expect(result.errors?.description).toContain('説明は5000文字以内で入力してください');
    });

    it('should reject negative amount', () => {
      const input = {
        title: '申請',
        amount: -1000,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(false);
      expect(result.errors?.amount).toContain('金額は0以上で入力してください');
    });

    it('should accept zero amount', () => {
      const input = {
        title: '申請',
        amount: 0,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(true);
    });

    it('should reject amount exceeding maximum', () => {
      const input = {
        title: '申請',
        amount: 9999999999999,
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(false);
      expect(result.errors?.amount).toContain('金額が上限を超えています');
    });

    it('should reject invalid category', () => {
      const input = {
        title: '申請',
        amount: 10000,
        category: 'invalid',
      };

      const result = validate(createApprovalSchema, input);
      expect(result.success).toBe(false);
    });

    it('should accept all valid categories', () => {
      const categories = ['expense', 'purchase', 'contract', 'other'];

      for (const category of categories) {
        const input = {
          title: '申請',
          amount: 10000,
          category,
        };

        const result = validate(createApprovalSchema, input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('updateApprovalSchema', () => {
    it('should accept partial update', () => {
      const input = {
        title: '更新されたタイトル',
      };

      const result = validate(updateApprovalSchema, input);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = validate(updateApprovalSchema, {});
      expect(result.success).toBe(true);
    });

    it('should validate title length', () => {
      const input = {
        title: 'あ'.repeat(201),
      };

      const result = validate(updateApprovalSchema, input);
      expect(result.success).toBe(false);
    });
  });

  describe('approveSchema', () => {
    it('should accept with comment', () => {
      const input = {
        comment: '承認します',
      };

      const result = validate(approveSchema, input);
      expect(result.success).toBe(true);
    });

    it('should accept without comment', () => {
      const result = validate(approveSchema, {});
      expect(result.success).toBe(true);
    });

    it('should reject comment over 1000 characters', () => {
      const input = {
        comment: 'あ'.repeat(1001),
      };

      const result = validate(approveSchema, input);
      expect(result.success).toBe(false);
    });
  });

  describe('rejectSchema', () => {
    it('should accept with required comment', () => {
      const input = {
        comment: '予算超過のため却下',
      };

      const result = validate(rejectSchema, input);
      expect(result.success).toBe(true);
    });

    it('should reject without comment', () => {
      const result = validate(rejectSchema, {});
      expect(result.success).toBe(false);
      // Zod returns "Required" for missing fields
      expect(result.errors?.comment).toBeDefined();
    });

    it('should reject empty comment', () => {
      const input = {
        comment: '',
      };

      const result = validate(rejectSchema, input);
      expect(result.success).toBe(false);
    });
  });

  describe('returnSchema', () => {
    it('should accept with required comment', () => {
      const input = {
        comment: '詳細情報の追記をお願いします',
      };

      const result = validate(returnSchema, input);
      expect(result.success).toBe(true);
    });

    it('should reject without comment', () => {
      const result = validate(returnSchema, {});
      expect(result.success).toBe(false);
      // Zod returns "Required" for missing fields
      expect(result.errors?.comment).toBeDefined();
    });
  });

  describe('uuidSchema', () => {
    it('should accept valid UUID', () => {
      const result = validate(uuidSchema, '550e8400-e29b-41d4-a716-446655440000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = validate(uuidSchema, 'invalid-uuid');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = validate(uuidSchema, '');
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should use default values', () => {
      const result = validate(paginationSchema, {});
      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(20);
    });

    it('should accept valid page and limit', () => {
      const result = validate(paginationSchema, { page: '5', limit: '50' });
      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(5);
      expect(result.data?.limit).toBe(50);
    });

    it('should reject page less than 1', () => {
      const result = validate(paginationSchema, { page: '0' });
      expect(result.success).toBe(false);
    });

    it('should reject limit over 100', () => {
      const result = validate(paginationSchema, { limit: '101' });
      expect(result.success).toBe(false);
    });
  });
});
