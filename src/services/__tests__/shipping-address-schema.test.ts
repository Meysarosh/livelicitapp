import { describe, expect, it } from 'vitest';
import { ShippingAddressFormSchema } from '@/services/zodValidation-service';

describe('ShippingAddressFormSchema', () => {
  const base = {
    street: 'Main street 1',
    city: 'Budapest',
    state: 'Pest',
    postalCode: '1111',
    country: 'HU',
  };

  it('accepts valid address', () => {
    const res = ShippingAddressFormSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it('trims fields', () => {
    const res = ShippingAddressFormSchema.safeParse({
      street: '  Main street 1  ',
      city: '  Budapest  ',
      state: '  Pest  ',
      postalCode: '  1111  ',
      country: '  hu  ',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.street).toBe('Main street 1');
      expect(res.data.city).toBe('Budapest');
      expect(res.data.state).toBe('Pest');
      expect(res.data.postalCode).toBe('1111');
      expect(res.data.country).toBe('HU');
    }
  });

  it('allows state to be omitted', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      state: undefined,
    });

    expect(res.success).toBe(true);
  });

  it('rejects empty street', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      street: '   ',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.street?.[0]).toMatch(/required/i);
    }
  });

  it('rejects too long street', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      street: 'A'.repeat(256),
    });

    expect(res.success).toBe(false);
  });

  it('rejects empty city', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      city: '',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.city?.[0]).toMatch(/required/i);
    }
  });

  it('rejects too long city', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      city: 'A'.repeat(101),
    });

    expect(res.success).toBe(false);
  });

  it('rejects too long state', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      state: 'A'.repeat(101),
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.state?.[0]).toMatch(/too long/i);
    }
  });

  it('rejects empty postalCode', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      postalCode: ' ',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.postalCode?.[0]).toMatch(/required/i);
    }
  });

  it('rejects too long postalCode', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      postalCode: '1'.repeat(21),
    });

    expect(res.success).toBe(false);
  });

  it('rejects missing country', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      country: '',
    });

    expect(res.success).toBe(false);
  });

  it('rejects country codes that are not 2 letters', () => {
    const res1 = ShippingAddressFormSchema.safeParse({
      ...base,
      country: 'HUN',
    });

    const res2 = ShippingAddressFormSchema.safeParse({
      ...base,
      country: '1H',
    });

    expect(res1.success).toBe(false);
    expect(res2.success).toBe(false);
  });

  it('uppercases lowercase country input', () => {
    const res = ShippingAddressFormSchema.safeParse({
      ...base,
      country: 'hu',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.country).toBe('HU');
    }
  });
});
