'use server';

import bcrypt from 'bcrypt';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { PasswordFormSchema, type PasswordFormState } from '@/services/zodValidation-service';
import { createUserPassword, getUserPassword, updateUserPassword } from '@/data-access/user/user';

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const user = await getAuthUser();

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

  const userCreds = await getUserPassword(user.id);

  const hasLocalPassword = !!userCreds;
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

    const isPasswordMatch = await bcrypt.compare(currentPassword, userCreds.passHash);
    if (!isPasswordMatch) {
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
      await updateUserPassword(userCreds.userId, hash);
    } else {
      await createUserPassword(user.id, hash);
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
