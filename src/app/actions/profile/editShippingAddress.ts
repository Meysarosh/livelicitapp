'use server';

import { upsertShippingAddress } from '@/data-access/shippingAddress';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { ShippingAddressFormSchema, type ShippingAddressFormState } from '@/services/zodValidation-service';

export async function editShippingAddress(
  _prevState: ShippingAddressFormState,
  formData: FormData
): Promise<ShippingAddressFormState> {
  const user = await getAuthUser();

  if (!user) {
    return {
      message: 'You must be signed in to update your shipping address.',
    };
  }

  const raw = {
    street: formData.get('street'),
    city: formData.get('city'),
    state: formData.get('state'),
    postalCode: formData.get('postalCode'),
    country: formData.get('country'),
  };

  const parsed = ShippingAddressFormSchema.safeParse({
    street: raw.street ?? '',
    city: raw.city ?? '',
    state: raw.state ?? '',
    postalCode: raw.postalCode ?? '',
    country: raw.country ?? '',
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        street: fieldErrors.street,
        city: fieldErrors.city,
        state: fieldErrors.state,
        postalCode: fieldErrors.postalCode,
        country: fieldErrors.country,
      },
      values: {
        street: (raw.street as string | null) ?? undefined,
        city: (raw.city as string | null) ?? undefined,
        state: (raw.state as string | null) ?? undefined,
        postalCode: (raw.postalCode as string | null) ?? undefined,
        country: (raw.country as string | null) ?? undefined,
      },
    };
  }

  const { street, city, state, postalCode, country } = parsed.data;

  try {
    await upsertShippingAddress(user.id, street, city, state || null, postalCode, country);
  } catch (err) {
    console.error('APP/ACTIONS/UPDATE_SHIPPING_ADDRESS:', err);

    return {
      message: 'Server error. Please try again.',
      values: {
        street,
        city,
        state,
        postalCode,
        country,
      },
    };
  }

  return {
    message: 'Shipping address saved successfully.',
    values: {
      street,
      city,
      state,
      postalCode,
      country,
    },
  };
}
