import { describe, expect, it } from 'vitest';
import { PasswordFormSchema } from '@/services/zodValidation-service';

describe('PasswordFormSchema', () => {
  const base = {
    currentPassword: '',
    newPassword: 'abc123',
    confirmPassword: 'abc123',
  };

  it('accepts set-password flow with empty currentPassword', () => {
    const res = PasswordFormSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it('accepts change-password flow with currentPassword provided', () => {
    const res = PasswordFormSchema.safeParse({
      ...base,
      currentPassword: 'oldPass123',
    });

    expect(res.success).toBe(true);
  });

  it('trims passwords', () => {
    const res = PasswordFormSchema.safeParse({
      currentPassword: '  oldPass123  ',
      newPassword: '  abc123  ',
      confirmPassword: '  abc123  ',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.currentPassword).toBe('oldPass123');
      expect(res.data.newPassword).toBe('abc123');
      expect(res.data.confirmPassword).toBe('abc123');
    }
  });

  it('rejects newPassword shorter than 6 chars', () => {
    const res = PasswordFormSchema.safeParse({
      ...base,
      newPassword: 'ab12',
      confirmPassword: 'ab12',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.newPassword?.[0]).toMatch(/at least 6/i);
    }
  });

  it('rejects newPassword without a letter', () => {
    const res = PasswordFormSchema.safeParse({
      ...base,
      newPassword: '123456',
      confirmPassword: '123456',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.newPassword).toEqual(expect.arrayContaining([expect.stringMatching(/include a letter/i)]));
    }
  });

  it('rejects newPassword without a number', () => {
    const res = PasswordFormSchema.safeParse({
      ...base,
      newPassword: 'abcdef',
      confirmPassword: 'abcdef',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.newPassword).toEqual(expect.arrayContaining([expect.stringMatching(/include a number/i)]));
    }
  });

  it('rejects confirmPassword shorter than 6 chars', () => {
    const res = PasswordFormSchema.safeParse({
      ...base,
      confirmPassword: 'abc',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.confirmPassword?.[0]).toMatch(/at least 6/i);
    }
  });

  it('rejects mismatched confirmPassword with refine message', () => {
    const res = PasswordFormSchema.safeParse({
      ...base,
      confirmPassword: 'abc124',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.confirmPassword).toEqual(expect.arrayContaining([expect.stringMatching(/do not match/i)]));
    }
  });
});
