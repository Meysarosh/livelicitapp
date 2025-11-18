import * as z from 'zod';

export const LoginFormSchema = z.object({
  identifier: z.string({ message: 'Please enter a valid email or nickname.' }).trim(),
  password: z.string().min(6, { message: 'Password is required.' }).trim(),
});

export type LoginFormState =
  | {
      message?: string;
      values?: { identifier?: string };
    }
  | undefined;

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
