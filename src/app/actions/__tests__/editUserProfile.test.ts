import { describe, it, expect, vi, beforeEach } from 'vitest';
import { editUserProfile } from '../profile/editUserProfile';
import type { ProfileFormState } from '@/services/zodValidation-service';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getUserProfile, updateUserProfile } from '@/data-access/user';
import { validateImageFile } from '@/services/validateImageFile';
import { put, del } from '@vercel/blob';
import { MAX_FILE_SIZE } from '@/lib/constants';

vi.mock('@/lib/auth/getAuthUser', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/data-access/user', () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  del: vi.fn(),
}));

vi.mock('@/services/validateImageFile', () => ({
  validateImageFile: vi.fn(),
}));

const mockedGetAuthUser = vi.mocked(getAuthUser);
const mockedGetUserProfile = vi.mocked(getUserProfile);
const mockedUpdateUserProfile = vi.mocked(updateUserProfile);
const mockedPut = vi.mocked(put);
const mockedDel = vi.mocked(del);
const mockedValidateImageFile = vi.mocked(validateImageFile);

const mockedUser = {
  id: 'user-1',
  role: 'USER' as const,
  email: 'user1@example.com',
  nickname: 'user1',
  status: 'OK' as const,
  sessionVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ratingAvg: 4.5,
  ratingCount: 10,
  fullName: null,
  phone: null,
  logoUrl: null,
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  avatarUrl: null,
  locale: null,
  timezone: null,
  currency: 'HUF',
};

const mockedAuthUser = {
  id: 'user-1',
  role: 'USER' as const,
  email: 'user1@example.com',
  nickname: 'user1',
};

const mockedProfile = {
  email: 'user1@example.com',
  nickname: 'user-1',
  fullName: 'Old Name',
  phone: '123456',
  avatarUrl: 'https://blob.example.com/old-avatar.png',
};

const mockedBlobInfo = {
  url: 'https://blob.example.com/new-avatar.png',
  downloadUrl: 'https://blob.example.com/old-avatar.png',
  pathname: '/old-avatar.png',
  contentType: 'image/png',
  contentDisposition: 'inline',
};

function makeFormData(values: Record<string, string | File | undefined>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(values)) {
    if (val !== undefined) {
      fd.set(key, val);
    }
  }
  return fd;
}

describe('editUserProfile action', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetAuthUser.mockResolvedValue(mockedAuthUser);
    mockedGetUserProfile.mockResolvedValue(mockedProfile);
  });

  it('returns validation errors when input is invalid', async () => {
    const formData = makeFormData({
      fullName: 'John Doe',
      phone: 'abc123',
    });

    const result = (await editUserProfile(undefined as ProfileFormState, formData)) as ProfileFormState;

    expect(result?.errors).toBeDefined();
    expect(result?.errors?.phone).toBeTruthy();

    expect(mockedPut).not.toHaveBeenCalled();
    expect(mockedDel).not.toHaveBeenCalled();
    expect(mockedUpdateUserProfile).not.toHaveBeenCalled();

    expect(result?.values).toEqual({
      fullName: 'John Doe',
      phone: 'abc123',
    });
  });

  it('updates profile successfully without avatar upload', async () => {
    mockedUpdateUserProfile.mockResolvedValueOnce(mockedUser);

    const formData = makeFormData({
      fullName: 'New Name',
      phone: '123 456 789',
      // no avatar field
    });

    const result = (await editUserProfile(undefined as ProfileFormState, formData)) as ProfileFormState;

    expect(mockedValidateImageFile).not.toHaveBeenCalled();
    expect(mockedPut).not.toHaveBeenCalled();
    // old avatar not deleted if no new avatar is uploaded
    expect(mockedDel).not.toHaveBeenCalled();

    expect(mockedUpdateUserProfile).toHaveBeenCalledTimes(1);
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith(
      'user-1',
      'New Name',
      '123 456 789',
      undefined // avatarUrl
    );

    expect(result?.message).toBe('Profile updated successfully.');
    expect(result?.values).toEqual({
      fullName: 'New Name',
      phone: '123 456 789',
    });
  });

  it('returns avatar error if file is larger than MAX_FILE_SIZE', async () => {
    const bigFile = new File(['x'.repeat(10)], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(bigFile, 'size', { value: MAX_FILE_SIZE + 1 });

    const formData = makeFormData({
      fullName: 'John Doe',
      phone: '123456',
      avatar: bigFile,
    });

    const result = (await editUserProfile(undefined as ProfileFormState, formData)) as ProfileFormState;

    expect(result?.errors?.avatar).toEqual(['Avatar must be at most 5 MB.']);
    // no image validation or upload or DB write
    expect(mockedValidateImageFile).not.toHaveBeenCalled();
    expect(mockedPut).not.toHaveBeenCalled();
    expect(mockedUpdateUserProfile).not.toHaveBeenCalled();
    // old avatar is not deleted in this early-return branch
    expect(mockedDel).not.toHaveBeenCalled();

    expect(result?.values).toEqual({
      fullName: 'John Doe',
      phone: '123456',
    });
  });

  it('uploads valid avatar, deletes previous one and updates profile', async () => {
    const file = new File(['avatar'], 'my avatar.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    mockedValidateImageFile.mockResolvedValueOnce({ valid: true });
    mockedPut.mockResolvedValueOnce(mockedBlobInfo);
    mockedUpdateUserProfile.mockResolvedValueOnce(mockedUser);

    const formData = makeFormData({
      fullName: 'Jane Doe',
      phone: '987654',
      avatar: file,
    });

    const result = (await editUserProfile(undefined as ProfileFormState, formData)) as ProfileFormState;

    expect(mockedValidateImageFile).toHaveBeenCalledTimes(1);
    expect(mockedPut).toHaveBeenCalledTimes(1);
    expect(mockedUpdateUserProfile).toHaveBeenCalledTimes(1);

    expect(mockedUpdateUserProfile).toHaveBeenCalledWith(
      'user-1',
      'Jane Doe',
      '987654',
      'https://blob.example.com/new-avatar.png'
    );

    // previous avatar deleted in finally block
    expect(mockedDel).toHaveBeenCalledWith('https://blob.example.com/old-avatar.png');

    expect(result?.message).toBe('Profile updated successfully.');
    expect(result?.values).toEqual({
      fullName: 'Jane Doe',
      phone: '987654',
    });
  });

  it('returns upload error message if avatar upload fails and deletes old avatar', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    mockedValidateImageFile.mockResolvedValueOnce({ valid: true });
    mockedPut.mockRejectedValueOnce(new Error('Upload failed'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const formData = makeFormData({
      fullName: 'Jane Doe',
      phone: '987654',
      avatar: file,
    });

    const result = (await editUserProfile(undefined as ProfileFormState, formData)) as ProfileFormState;

    expect(mockedPut).toHaveBeenCalledTimes(1);
    expect(mockedUpdateUserProfile).not.toHaveBeenCalled();

    // old avatar should be deleted in finally
    expect(mockedDel).toHaveBeenCalledWith('https://blob.example.com/old-avatar.png');

    expect(result?.message).toBe('Failed to upload avatar. Please try again.');
    expect(result?.values).toEqual({
      fullName: 'Jane Doe',
      phone: '987654',
    });

    errorSpy.mockRestore();
  });

  it('deletes new avatar and returns server error if DB update fails', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    mockedValidateImageFile.mockResolvedValueOnce({ valid: true });
    mockedPut.mockResolvedValueOnce(mockedBlobInfo);
    mockedUpdateUserProfile.mockRejectedValueOnce(new Error('DB failure'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const formData = makeFormData({
      fullName: 'Jane Doe',
      phone: '987654',
      avatar: file,
    });

    const result = (await editUserProfile(undefined as ProfileFormState, formData)) as ProfileFormState;

    // upload was attempted
    expect(mockedPut).toHaveBeenCalledTimes(1);
    // DB update failed
    expect(mockedUpdateUserProfile).toHaveBeenCalledTimes(1);

    // new avatar should be deleted on failure
    expect(mockedDel).toHaveBeenCalledWith('https://blob.example.com/new-avatar.png');

    expect(result?.message).toBe('Server error. Please try again.');
    expect(result?.values).toEqual({
      fullName: 'Jane Doe',
      phone: '987654',
    });

    errorSpy.mockRestore();
  });
});
