import * as z from 'zod';
import { DEFAULT_CURRENCY } from '@/lib/constants';

// --- Login ---

export const LoginFormSchema = z.object({
  identifier: z.string({ message: 'Please enter a valid email or nickname.' }).trim(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).trim(),
});

export type LoginFormState =
  | {
      message?: string;
      values?: { identifier?: string };
    }
  | undefined;

// --- Register ---

export const RegisterFormSchema = z
  .object({
    nickname: z
      .string()
      .min(2, { message: 'Nickname must be at least 2 characters.' })
      .max(50, { message: 'Nickname must be at most 50 characters.' })
      .trim(),
    email: z.email({ message: 'Please enter a valid email.' }).trim(),
    password: z
      .string()
      .min(6, { message: 'At least 6 characters.' })
      .regex(/[a-zA-Z]/, { message: 'Include a letter.' })
      .regex(/[0-9]/, { message: 'Include a number.' })
      .trim(),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }).trim(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type RegisterFormState =
  | {
      errors?: {
        nickname?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      values?: {
        nickname?: string;
        email?: string;
      };
    }
  | undefined;

// --- Create Auction ---

export const durationDayOptions = ['1', '3', '5', '7', 'test'] as const;

export const CreateAuctionFormSchema = z
  .object({
    title: z
      .string({ message: 'Please enter a title.' })
      .min(3, { message: 'Title must be at least 3 characters.' })
      .max(255, { message: 'Title must be at most 255 characters.' })
      .trim(),

    description: z
      .string({ message: 'Please enter a description.' })
      .min(10, { message: 'Description must be at least 10 characters.' })
      .trim(),

    startingPrice: z
      .string({ message: 'Please enter starting price.' })
      .trim()
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
        message: 'Starting price must be a number greater than 0.',
      }),

    minIncrement: z
      .string({ message: 'Please enter minimum increment.' })
      .trim()
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
        message: 'Minimum increment must be a number greater than 0.',
      }),

    durationDays: z.enum(durationDayOptions, {
      error: 'Please choose duration in days.',
    }),

    currency: z
      .string()
      .trim()
      .length(3, { message: 'Currency must be a 3-letter code.' })
      .default(DEFAULT_CURRENCY),

    startMode: z.enum(['now', 'future']).default('now'),

    // normalize null/empty string → undefined, so "start now" works fine
    startAt: z.preprocess((v) => (v === null || v === '' ? undefined : v), z.string().optional()),

    imageUrls: z.string().max(2000, { message: 'Image URLs text is too long.' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startMode === 'future') {
      if (!data.startAt) {
        ctx.addIssue({
          path: ['startAt'],
          code: 'custom', // v4: use literal "custom" instead of ZodIssueCode.custom
          message: 'Please choose start date and time.',
        });
        return;
      }

      const parsed = new Date(data.startAt);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          path: ['startAt'],
          code: 'custom',
          message: 'Invalid date/time.',
        });
        return;
      }

      const now = new Date();
      if (parsed <= now) {
        ctx.addIssue({
          path: ['startAt'],
          code: 'custom',
          message: 'Start date/time must be in the future.',
        });
      }
    }
  });

export type CreateAuctionFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        startingPrice?: string[];
        minIncrement?: string[];
        durationDays?: string[];
        currency?: string[];
        startMode?: string[];
        startAt?: string[];
        imageUrls?: string[];
      };
      message?: string;
      values?: {
        title?: string;
        description?: string;
        startingPrice?: string;
        minIncrement?: string;
        durationDays?: (typeof durationDayOptions)[number]; // '1' | '3' | '5' | '7' | 'test'
        currency?: string;
        startMode?: 'now' | 'future';
        startAt?: string;
        imageUrls?: string;
      };
    }
  | undefined;

// --- Place Bid ---

export const PlaceBidFormSchema = z.object({
  auctionId: z.string().min(1, { message: 'Missing auction id.' }),
  amount: z
    .string({ message: 'Please enter your bid.' })
    .trim()
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: 'Bid amount must be a number greater than 0.',
    }),
});

export type PlaceBidFormState =
  | {
      errors?: {
        amount?: string[];
      };
      message?: string;
      values?: {
        amount?: string;
      };
    }
  | undefined;
