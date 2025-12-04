'use server';

import bcrypt from 'bcrypt';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { PasswordFormSchema, type PasswordFormState } from '@/services/zodValidation-service';
import { getUserWithCredentials } from '@/data-access/user';
import { createUserCredential, updateUserCredential } from '@/data-access/userCredentials';

export async function changePassword(_prevState: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  const user = await getAuthUser();

  if (!user) {
    return {
      message: 'You must be signed in to change your password.',
    };
  }

  const raw = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = PasswordFormSchema.safeParse({
    currentPassword: raw.currentPassword ?? '',
    newPassword: raw.newPassword ?? '',
    confirmPassword: raw.confirmPassword ?? '',
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        currentPassword: fieldErrors.currentPassword,
        newPassword: fieldErrors.newPassword,
        confirmPassword: fieldErrors.confirmPassword,
      },
    };
  }

  const dbUser = await getUserWithCredentials(user.id);

  if (!dbUser) {
    return {
      message: 'User not found.',
    };
  }

  const hasLocalPassword = !!dbUser.credentials;
  const { currentPassword, newPassword } = parsed.data;

  // If user already has a local password, require and verify current password
  if (hasLocalPassword) {
    if (!currentPassword) {
      return {
        errors: {
          currentPassword: ['Current password is required.'],
        },
      };
    }

    const ok = await bcrypt.compare(currentPassword, dbUser.credentials!.passHash);
    if (!ok) {
      return {
        errors: {
          currentPassword: ['Current password is incorrect.'],
        },
      };
    }
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);

    if (hasLocalPassword) {
      await updateUserCredential(dbUser.id, hash);
    } else {
      await createUserCredential(dbUser.id, hash);
    }
  } catch (err) {
    console.error('APP/ACTIONS/CHANGE_PASSWORD:', err);

    return {
      message: 'Server error. Please try again.',
    };
  }

  return {
    message: hasLocalPassword ? 'Password updated successfully.' : 'Password set successfully.',
  };
}
