'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { ProfileFormSchema, type ProfileFormState } from '@/services/zodValidation-service';
import { del, put } from '@vercel/blob';
import { MAX_FILE_SIZE } from '@/lib/constants';
import { updateUserProfile } from '@/data-access/user';

const MAX_AVATAR_SIZE = MAX_FILE_SIZE;

export async function updateProfile(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getAuthUser();
  if (!user) {
    return {
      message: 'You must be signed in to update your profile.',
    };
  }

  const raw = {
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
  };

  const avatar = formData.get('avatar');

  const parsed = ProfileFormSchema.safeParse({
    fullName: raw.fullName ?? '',
    phone: raw.phone ?? '',
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: {
        fullName: fieldErrors.fullName,
        phone: fieldErrors.phone,
      },
      values: {
        fullName: (raw.fullName as string | null) ?? undefined,
        phone: (raw.phone as string | null) ?? undefined,
      },
    };
  }

  let avatarUrl: string | undefined;

  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > MAX_AVATAR_SIZE) {
      return {
        errors: {
          avatar: ['Avatar must be at most 5 MB.'],
        },
        values: {
          fullName: parsed.data.fullName || undefined,
          phone: parsed.data.phone || undefined,
        },
      };
    }

    const safeName = avatar.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    try {
      const blob = await put(`avatars/${user.id}/${crypto.randomUUID()}-${safeName}`, avatar, {
        access: 'public',
      });

      avatarUrl = blob.url;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      return {
        message: 'Failed to upload avatar. Please try again.',
        values: {
          fullName: parsed.data.fullName || undefined,
          phone: parsed.data.phone || undefined,
        },
      };
    }
  }

  try {
    await updateUserProfile(user.id, parsed.data.fullName || null, parsed.data.phone || null, avatarUrl);
  } catch (err) {
    console.error('APP/ACTIONS/UPDATE_PROFILE:', err);

    if (avatarUrl) {
      await del(avatarUrl);
    }

    return {
      message: 'Server error. Please try again.',
      values: {
        fullName: parsed.data.fullName || undefined,
        phone: parsed.data.phone || undefined,
      },
    };
  }

  return {
    message: 'Profile updated successfully.',
    values: {
      fullName: parsed.data.fullName || undefined,
      phone: parsed.data.phone || undefined,
    },
  };
}
