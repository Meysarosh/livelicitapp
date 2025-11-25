'use server';

import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as z from 'zod';
import { RegisterFormSchema, type RegisterFormState } from '@/services/zodValidation-service';
import { signIn } from '@/lib/auth';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { createUser } from '@/data-access/user';

export async function register(prev: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
  const raw = {
    nickname: formData.get('nickname'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = RegisterFormSchema.safeParse(raw);

  if (!parsed.success) {
    const f = z.flattenError(parsed.error);
    return {
      errors: {
        nickname: f.fieldErrors.nickname,
        email: f.fieldErrors.email,
        password: f.fieldErrors.password,
        confirmPassword: f.fieldErrors.confirmPassword,
      },
      values: {
        nickname: typeof raw.nickname === 'string' ? raw.nickname : undefined,
        email: typeof raw.email === 'string' ? raw.email : undefined,
      },
    };
  }

  const { nickname, email, password } = parsed.data;

  const hash = await bcrypt.hash(password, 10);

  try {
    await createUser(nickname, email, hash);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const target = (err.meta?.target ?? []) as string[];
      const errors: {
        nickname?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      } = {};
      if (target.includes('email')) {
        errors.email = ['This email is already registered.'];
      }
      if (target.includes('nickname')) {
        errors.nickname = ['This nickname is already taken.'];
      }
      return { errors, values: { email, nickname } };
    }
    console.log('APP/ACTIONS/REGISTER: unexpected error', err);
    return { message: 'Server error. Please try again.', values: { email, nickname } };
  }

  try {
    await signIn('credentials', { identifier: email, password, redirectTo: '/auctions' });
  } catch (err) {
    if (isNextRedirectError(err)) throw err;

    console.log('APP/ACTIONS/REGISTER:', err);

    return { message: 'Server error. Please try again.', values: { email } };
  }
}
