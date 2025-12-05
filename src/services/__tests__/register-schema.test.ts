import { describe, expect, it } from 'vitest';
import { RegisterFormSchema } from '@/services/zodValidation-service';

describe('RegisterFormSchema', () => {
  const base = {
    nickname: 'John',
    email: 'john@example.com',
    password: 'abc123',
    confirmPassword: 'abc123',
  };

  it('accepts valid data', () => {
    const res = RegisterFormSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it('trims fields', () => {
    const res = RegisterFormSchema.safeParse({
      nickname: '  John  ',
      email: '  john@example.com  ',
      password: '  abc123  ',
      confirmPassword: '  abc123  ',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.nickname).toBe('John');
      expect(res.data.email).toBe('john@example.com');
      expect(res.data.password).toBe('abc123');
      expect(res.data.confirmPassword).toBe('abc123');
    }
  });

  it('rejects nickname shorter than 2 chars', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      nickname: 'A',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.nickname?.[0]).toMatch(/at least 2/i);
    }
  });

  it('rejects nickname longer than 50 chars', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      nickname: 'A'.repeat(51),
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.nickname?.[0]).toMatch(/at most 50/i);
    }
  });

  it('rejects invalid email', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      email: 'not-an-email',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.email?.[0]).toMatch(/valid email/i);
    }
  });

  it('rejects password shorter than 6 chars', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      password: 'ab12',
      confirmPassword: 'ab12',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.password?.[0]).toMatch(/at least 6/i);
    }
  });

  it('rejects password without a letter', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      password: '123456',
      confirmPassword: '123456',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.password).toEqual(expect.arrayContaining([expect.stringMatching(/include a letter/i)]));
    }
  });

  it('rejects password without a number', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      password: 'abcdef',
      confirmPassword: 'abcdef',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.password).toEqual(expect.arrayContaining([expect.stringMatching(/include a number/i)]));
    }
  });

  it('rejects confirmPassword when too short', () => {
    const res = RegisterFormSchema.safeParse({
      ...base,
      confirmPassword: 'abc',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.confirmPassword?.[0]).toMatch(/confirm your password/i);
    }
  });

  it('rejects mismatched passwords with refine message', () => {
    const res = RegisterFormSchema.safeParse({
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
