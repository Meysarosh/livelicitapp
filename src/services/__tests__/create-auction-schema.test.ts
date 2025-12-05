import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CreateAuctionFormSchema, durationDayOptions } from '@/services/zodValidation-service';
import { DEFAULT_CURRENCY } from '@/lib/constants';

describe('CreateAuctionFormSchema', () => {
  const base = {
    title: 'Great item',
    description: 'This is a valid description.',
    startingPrice: '10',
    minIncrement: '1',
    durationDays: '7' as (typeof durationDayOptions)[number],
    currency: 'USD',
    startMode: 'now' as const,
    startAt: undefined as string | undefined,
    imageUrls: '',
  };

  it('accepts valid "start now" payload', () => {
    const res = CreateAuctionFormSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it('trims title/description/price fields', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      title: '  Great item  ',
      description: '  This is a valid description.  ',
      startingPrice: '  10  ',
      minIncrement: '  1  ',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.title).toBe('Great item');
      expect(res.data.description).toBe('This is a valid description.');
      expect(res.data.startingPrice).toBe('10');
      expect(res.data.minIncrement).toBe('1');
    }
  });

  it('rejects title shorter than 3 chars', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      title: 'Hi',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.title?.[0]).toMatch(/at least 3/i);
    }
  });

  it('rejects description shorter than 10 chars', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      description: 'Too short',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.description?.[0]).toMatch(/at least 10/i);
    }
  });

  it('rejects startingPrice <= 0', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      startingPrice: '0',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.startingPrice?.[0]).toMatch(/greater than 0/i);
    }
  });

  it('rejects startingPrice non-numeric', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      startingPrice: 'abc',
    });

    expect(res.success).toBe(false);
  });

  it('rejects minIncrement <= 0', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      minIncrement: '-1',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.minIncrement?.[0]).toMatch(/greater than 0/i);
    }
  });

  it('rejects invalid durationDays', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      durationDays: '2',
    });

    expect(res.success).toBe(false);
  });

  it('validates currency length', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      currency: 'US',
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.currency?.[0]).toMatch(/3-letter/i);
    }
  });

  it('applies DEFAULT_CURRENCY when currency is omitted', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      currency: undefined,
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.currency).toBe(DEFAULT_CURRENCY);
    }
  });

  it('preprocesses startAt empty string to undefined (startMode=now)', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      startMode: 'now',
      startAt: '',
    });

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.startAt).toBeUndefined();
    }
  });

  describe('startMode="future" date rules', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('requires startAt when startMode is future', () => {
      const res = CreateAuctionFormSchema.safeParse({
        ...base,
        startMode: 'future',
        startAt: undefined,
      });

      expect(res.success).toBe(false);

      if (!res.success) {
        const errors = res.error.flatten().fieldErrors;
        expect(errors.startAt?.[0]).toMatch(/choose start date/i);
      }
    });

    it('rejects invalid date string', () => {
      const res = CreateAuctionFormSchema.safeParse({
        ...base,
        startMode: 'future',
        startAt: 'not-a-date',
      });

      expect(res.success).toBe(false);

      if (!res.success) {
        const errors = res.error.flatten().fieldErrors;
        expect(errors.startAt?.[0]).toMatch(/invalid date/i);
      }
    });

    it('rejects past date', () => {
      const res = CreateAuctionFormSchema.safeParse({
        ...base,
        startMode: 'future',
        startAt: '2024-12-31T10:00:00.000Z',
      });

      expect(res.success).toBe(false);

      if (!res.success) {
        const errors = res.error.flatten().fieldErrors;
        expect(errors.startAt?.[0]).toMatch(/must be in the future/i);
      }
    });

    it('accepts a future date', () => {
      const res = CreateAuctionFormSchema.safeParse({
        ...base,
        startMode: 'future',
        startAt: '2025-01-02T10:00:00.000Z',
      });

      expect(res.success).toBe(true);
    });
  });

  it('rejects overly long imageUrls text', () => {
    const res = CreateAuctionFormSchema.safeParse({
      ...base,
      imageUrls: 'a'.repeat(2001),
    });

    expect(res.success).toBe(false);

    if (!res.success) {
      const errors = res.error.flatten().fieldErrors;
      expect(errors.imageUrls?.[0]).toMatch(/too long/i);
    }
  });
});
