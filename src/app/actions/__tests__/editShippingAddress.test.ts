import { describe, it, expect, vi, beforeEach } from 'vitest';
import { editShippingAddress } from '../profile/editShippingAddress';
import type { ShippingAddressFormState } from '@/services/zodValidation-service';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { upsertShippingAddress } from '@/data-access/shippingAddress';

vi.mock('@/lib/auth/getAuthUser', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/data-access/shippingAddress', () => ({
  upsertShippingAddress: vi.fn(),
}));

const mockedGetAuthUser = vi.mocked(getAuthUser);
const mockedUpsertShippingAddress = vi.mocked(upsertShippingAddress);

function makeFormData(values: Record<string, string | undefined>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(values)) {
    if (val !== undefined) {
      fd.set(key, val);
    }
  }
  return fd;
}

const mockedUser = { id: 'user-1', role: 'USER' as const, email: 'user1@example.com', nickname: 'user1' };

describe('editShippingAddress action', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns validation errors when input is invalid', async () => {
    mockedGetAuthUser.mockResolvedValueOnce(mockedUser);

    const formData = makeFormData({
      street: '',
      city: '',
      postalCode: '',
      country: 'H',
    });

    const result = (await editShippingAddress(
      undefined as ShippingAddressFormState,
      formData
    )) as ShippingAddressFormState;

    expect(mockedUpsertShippingAddress).not.toHaveBeenCalled();
    expect(result?.errors).toBeDefined();

    expect(result?.errors?.street).toBeTruthy();
    expect(result?.errors?.city).toBeTruthy();
    expect(result?.errors?.postalCode).toBeTruthy();
    expect(result?.errors?.country).toBeTruthy();

    expect(result?.values?.street).toBe('');
    expect(result?.values?.city).toBe('');
    expect(result?.values?.postalCode).toBe('');
    expect(result?.values?.country).toBe('H');
  });

  it('upserts shipping address and returns success state on valid input', async () => {
    mockedGetAuthUser.mockResolvedValueOnce(mockedUser);
    mockedUpsertShippingAddress.mockResolvedValueOnce(undefined);

    const formData = makeFormData({
      street: 'Main street 12',
      city: 'Budapest',
      state: 'Pest',
      postalCode: '1234',
      country: 'hu',
    });

    const result = (await editShippingAddress(
      undefined as ShippingAddressFormState,
      formData
    )) as ShippingAddressFormState;

    expect(mockedUpsertShippingAddress).toHaveBeenCalledTimes(1);
    expect(mockedUpsertShippingAddress).toHaveBeenCalledWith(
      'user-1',
      'Main street 12',
      'Budapest',
      'Pest',
      '1234',
      'HU'
    );

    expect(result?.message).toBe('Shipping address saved successfully.');

    expect(result?.values).toEqual({
      street: 'Main street 12',
      city: 'Budapest',
      state: 'Pest',
      postalCode: '1234',
      country: 'HU',
    });
  });

  it('returns server error message if upsertShippingAddress throws', async () => {
    mockedGetAuthUser.mockResolvedValueOnce(mockedUser);
    mockedUpsertShippingAddress.mockRejectedValueOnce(new Error('DB failure'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const formData = makeFormData({
      street: 'Main street 12',
      city: 'Budapest',
      state: '',
      postalCode: '1234',
      country: 'HU',
    });

    const result = (await editShippingAddress(
      undefined as ShippingAddressFormState,
      formData
    )) as ShippingAddressFormState;

    expect(mockedUpsertShippingAddress).toHaveBeenCalledTimes(1);
    expect(result?.message).toBe('Server error. Please try again.');

    expect(result?.values).toEqual({
      street: 'Main street 12',
      city: 'Budapest',
      state: '',
      postalCode: '1234',
      country: 'HU',
    });

    errorSpy.mockRestore();
  });
});
