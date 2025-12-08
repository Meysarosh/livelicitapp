import { describe, expect, it, vi, beforeEach } from 'vitest';
import { changePassword } from '@/app/actions/profile/changePassword';

const getAuthUserMock = vi.fn();
vi.mock('@/lib/auth/getAuthUser', () => ({
  getAuthUser: () => getAuthUserMock(),
}));

const getUserWithCredentialsMock = vi.fn();
vi.mock('@/data-access/user', () => ({
  getUserWithCredentials: (id: string) => getUserWithCredentialsMock(id),
}));

const createUserCredentialMock = vi.fn();
const updateUserCredentialMock = vi.fn();
vi.mock('@/data-access/userCredentials', () => ({
  createUserCredential: (userId: string, hash: string) => createUserCredentialMock(userId, hash),
  updateUserCredential: (userId: string, hash: string) => updateUserCredentialMock(userId, hash),
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
    getUserWithCredentialsMock.mockReset();
    createUserCredentialMock.mockReset();
    updateUserCredentialMock.mockReset();
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
    getUserWithCredentialsMock.mockResolvedValue({
      id: 'user-1',
      credentials: { passHash: 'old-hash' },
    });

    const formData = new FormData();
    formData.set('currentPassword', '');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePassword(undefined, formData);

    expect(res?.errors?.currentPassword?.[0]).toBe('Current password is required.');
    expect(bcryptCompareMock).not.toHaveBeenCalled();
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(updateUserCredentialMock).not.toHaveBeenCalled();
    expect(createUserCredentialMock).not.toHaveBeenCalled();
  });

  it('rejects incorrect currentPassword when user has local credentials', async () => {
    getUserWithCredentialsMock.mockResolvedValue({
      id: 'user-1',
      credentials: { passHash: 'old-hash' },
    });

    bcryptCompareMock.mockResolvedValue(false);

    const formData = new FormData();
    formData.set('currentPassword', 'wrong-pass');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePassword(undefined, formData);

    expect(res?.errors?.currentPassword?.[0]).toBe('Current password is incorrect.');
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(updateUserCredentialMock).not.toHaveBeenCalled();
    expect(createUserCredentialMock).not.toHaveBeenCalled();
  });

  it('does NOT require currentPassword when user has no local credentials and creates credential', async () => {
    getUserWithCredentialsMock.mockResolvedValue({
      id: 'user-1',
      credentials: null,
    });

    const formData = new FormData();
    formData.set('currentPassword', '');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePassword(undefined, formData);

    expect(res?.errors?.currentPassword).toBeUndefined();
    expect(bcryptHashMock).toHaveBeenCalledWith('abc123', 10);
    expect(createUserCredentialMock).toHaveBeenCalledWith('user-1', 'hashed-new-password');
    expect(updateUserCredentialMock).not.toHaveBeenCalled();
    expect(res?.message).toBe('Password set successfully.');
  });

  it('updates credential when user already has local credentials', async () => {
    getUserWithCredentialsMock.mockResolvedValue({
      id: 'user-1',
      credentials: { passHash: 'old-hash' },
    });

    const formData = new FormData();
    formData.set('currentPassword', 'oldPass123');
    formData.set('newPassword', 'abc123');
    formData.set('confirmPassword', 'abc123');

    const res = await changePassword(undefined, formData);

    expect(bcryptCompareMock).toHaveBeenCalledWith('oldPass123', 'old-hash');
    expect(bcryptHashMock).toHaveBeenCalledWith('abc123', 10);
    expect(updateUserCredentialMock).toHaveBeenCalledWith('user-1', 'hashed-new-password');
    expect(createUserCredentialMock).not.toHaveBeenCalled();
    expect(res?.message).toBe('Password updated successfully.');
  });
});
