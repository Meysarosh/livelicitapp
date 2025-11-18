'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import * as z from 'zod';
import { RegisterFormSchema, type RegisterFormState } from '@/lib/formValidation/validation';
import { signIn } from '@/lib/auth';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';

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

  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    return {
      message: 'E-mail already in use.',
      values: { nickname, email },
    };
  }

  const nicknameExists = await prisma.user.findUnique({ where: { nickname } });
  if (nicknameExists) {
    return {
      message: 'Nickname already in use.',
      values: { nickname, email },
    };
  }

  const hash = await bcrypt.hash(password, 10);
  //TODO error handling
  await prisma.user.create({
    data: { nickname, email, credentials: { create: { passHash: hash } } },
  });
  try {
    await signIn('credentials', { identifier: email, password, redirectTo: '/auctions' });
  } catch (err) {
    if (isNextRedirectError(err)) throw err;

    console.log('APP/ACTIONS/REGISTER:', err);

    return { message: 'Server error. Please try again.', values: { email } };
  }
}
