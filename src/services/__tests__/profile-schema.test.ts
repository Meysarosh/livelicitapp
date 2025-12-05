import { describe, expect, it } from 'vitest';
import { ProfileFormSchema } from '@/services/zodValidation-service';

describe('ProfileFormSchema', () => {
  it('accepts empty object (all optional)', () => {
    const res = ProfileFormSchema.safeParse({});
    expect(res.success).toBe(true);
  });

  it('accepts valid fullName and phone', () => {
    const res = ProfileFormSchema.safeParse({
      fullName: 'John Doe',
      phone: '+36 (30) 123-4567',
    });

    expect(res.success).toBe(true);
  });

  it('trims fullName and phone', () => {
    const res = ProfileFormSchema.safeParse({
      fullName: '  John Doe  ',
      phone: '  +36 30 123-4567  ',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.fullName).toBe('John Doe');
      expect(res.data.phone).toBe('+36 30 123-4567');
    }
  });

  it('rejects fullName longer than 100 characters', () => {
    const res = ProfileFormSchema.safeParse({
      fullName: 'A'.repeat(101),
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.fullName?.[0]).toMatch(/at most 100/i);
    }
  });

  it('rejects phone longer than 30 characters', () => {
    const res = ProfileFormSchema.safeParse({
      phone: '1'.repeat(31),
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.phone?.[0]).toMatch(/at most 30/i);
    }
  });

  it('rejects phone with invalid characters', () => {
    const res = ProfileFormSchema.safeParse({
      phone: '+36 30 ABC-123',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.phone?.[0]).toMatch(/only digits/i);
    }
  });

  it('accepts phone with allowed characters only', () => {
    const res = ProfileFormSchema.safeParse({
      phone: '06 30 123 45 67',
    });

    expect(res.success).toBe(true);
  });
});
