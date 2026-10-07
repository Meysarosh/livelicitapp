import { describe, expect, it, vi, beforeEach } from 'vitest';
import { changePasswordAction } from '@/app/actions/profile/changePassword';

const getAuthUserMock = vi.fn();
vi.mock('@/lib/auth/getAuthUser', () => ({
  getAuthUser: () => getAuthUserMock(),
}));

const getUserPasswordMock = vi.fn();
const createUserPasswordMock = vi.fn();
const updateUserPasswordMock = vi.fn();
vi.mock('@/data-access/user/user', () => ({
  getUserPassword: (userId: string) => getUserPasswordMock(userId),
  createUserPassword: (userId: string, hash: string) => createUserPasswordMock(userId, hash),
  updateUserPassword: (userId: string, hash: string) => updateUserPasswordMock(userId, hash),
}));

const bcryptCompareMock = vi.fn();
const bcryptHashMock = vi.fn();

vi.mock('bcrypt', () => ({
  default: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compare: (...args: any[]) => bcryptCompareMock(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hash: (...args: any[]) => bcryptHashMock(...args),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compare: (...args: any[]) => bcryptCompareMock(...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hash: (...args: any[]) => bcryptHashMock(...args),
}));

describe('changePassword (server-side rules)', () => {
  beforeEach(() => {
    getAuthUserMock.mockReset();
    getUserPasswordMock.mockReset();
    createUserPasswordMock.mockReset();
    updateUserPasswordMock.mockReset();
    bcryptCompareMock.mockReset();
    bcryptHashMock.mockReset();

    getAuthUserMock.mockResolvedValue({
      id: 'user-1',
      role: 'USER',
    });

    bcryptCompareMock.mockResolvedValue(true);
    bcryptHashMock.mockResolvedValue('hashed-new-password');
  });

  it('requires currentPassword when user already has local credentials', async () => {
    getUserPasswordMock.mockResolvedValue({ userId: 'user-1', passHash: 'old-hash' });

    const formData = new FormData();
    formData.set('currentPassword', '');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePasswordAction(undefined, formData);

    expect(res?.errors?.currentPassword?.[0]).toBe('Current password is required.');
    expect(bcryptCompareMock).not.toHaveBeenCalled();
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(updateUserPasswordMock).not.toHaveBeenCalled();
    expect(createUserPasswordMock).not.toHaveBeenCalled();
  });

  it('rejects incorrect currentPassword when user has local credentials', async () => {
    getUserPasswordMock.mockResolvedValue({ userId: 'user-1', passHash: 'old-hash' });

    bcryptCompareMock.mockResolvedValue(false);

    const formData = new FormData();
    formData.set('currentPassword', 'wrong-pass');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePasswordAction(undefined, formData);

    expect(res?.errors?.currentPassword?.[0]).toBe('Current password is incorrect.');
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(updateUserPasswordMock).not.toHaveBeenCalled();
    expect(createUserPasswordMock).not.toHaveBeenCalled();
  });

  it('does NOT require currentPassword when user has no local credentials and creates credential', async () => {
    getUserPasswordMock.mockResolvedValue(null);

    const formData = new FormData();
    formData.set('currentPassword', '');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePasswordAction(undefined, formData);

    expect(res?.errors?.currentPassword).toBeUndefined();
    expect(bcryptHashMock).toHaveBeenCalledWith('abc123', 10);
    expect(createUserPasswordMock).toHaveBeenCalledWith('user-1', 'hashed-new-password');
    expect(updateUserPasswordMock).not.toHaveBeenCalled();
    expect(res?.message).toBe('Password set successfully.');
  });

  it('updates credential when user already has local credentials', async () => {
    getUserPasswordMock.mockResolvedValue({ userId: 'user-1', passHash: 'old-hash' });

    const formData = new FormData();
    formData.set('currentPassword', 'oldPass123');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePasswordAction(undefined, formData);

    expect(bcryptCompareMock).toHaveBeenCalledWith('oldPass123', 'old-hash');
    expect(bcryptHashMock).toHaveBeenCalledWith('abc123', 10);
    expect(updateUserPasswordMock).toHaveBeenCalledWith('user-1', 'hashed-new-password');
    expect(createUserPasswordMock).not.toHaveBeenCalled();
    expect(res?.message).toBe('Password updated successfully.');
  });
});
