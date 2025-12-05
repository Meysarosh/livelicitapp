'use server';

import { LoginFormSchema, type LoginFormState } from '@/services/zodValidation-service';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';

export async function login(prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const raw = {
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  };

  const parsed = LoginFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: 'Please enter a valid email and password.',
      values: { identifier: typeof raw.identifier === 'string' ? raw.identifier : undefined },
    };
  }

  const { identifier, password } = parsed.data;

  try {
    await signIn('credentials', { identifier, password, redirectTo: '/auctions' });
  } catch (err) {
    if (isNextRedirectError(err)) throw err;

    console.error('APP/ACTIONS/LOGIN:', err);

    if (err instanceof AuthError && err.type === 'CredentialsSignin') {
      return { message: 'Wrong identifier or password.', values: { identifier } };
    }
    return { message: 'Server error. Please try again.', values: { identifier } };
  }
}
