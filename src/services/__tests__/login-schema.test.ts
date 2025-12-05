import { describe, expect, it } from 'vitest';
import { LoginFormSchema } from '@/services/zodValidation-service';

describe('LoginFormSchema', () => {
  it('accepts valid identifier + password', () => {
    const res = LoginFormSchema.safeParse({
      identifier: 'john@example.com',
      password: 'secret1',
    });

    expect(res.success).toBe(true);
  });

  it('trims identifier and password', () => {
    const res = LoginFormSchema.safeParse({
      identifier: '   nickName   ',
      password: '   secret1   ',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.identifier).toBe('nickName');
      expect(res.data.password).toBe('secret1');
    }
  });

  it('rejects empty input', () => {
    const res = LoginFormSchema.safeParse({
      identifier: '',
      password: '',
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.identifier?.[0]).toMatch('Empty identifier not allowed.');
      expect(res.error.flatten().fieldErrors.password?.[0]).toMatch('Password must be at least 6 characters.');
    }
  });

  it('rejects password shorter than 6 chars', () => {
    const res = LoginFormSchema.safeParse({
      identifier: 'john',
      password: '12345',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.password?.[0]).toMatch(/at least 6/i);
    }
  });
});
