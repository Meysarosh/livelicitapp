'use client';

import { useActionState, useEffect, useState } from 'react';
import { editShippingAddress } from '@/app/actions/profile/editShippingAddress';
import type { ShippingAddressFormState } from '@/services/zodValidation-service';
import { Form, FormButtonRow } from '@/components/forms/form.styles';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Button, Title, Note, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';

type ShippingAddressFormProps = {
  address: {
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
};

export default function ShippingAddressForm({ address }: ShippingAddressFormProps) {
  const [state, formAction, pending] = useActionState<ShippingAddressFormState, FormData>(
    editShippingAddress,
    undefined
  );

  const router = useRouter();

  const initialStreet = address?.street ?? '';
  const initialCity = address?.city ?? '';
  const initialState = address?.state ?? '';
  const initialPostalCode = address?.postalCode ?? '';
  const initialCountry = address?.country ?? '';

  const [street, setStreet] = useState(initialStreet);
  const [city, setCity] = useState(initialCity);
  const [stateField, setStateField] = useState(initialState);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [country, setCountry] = useState(initialCountry);

  useEffect(() => {
    if (state?.message === 'Shipping address saved successfully.') {
      router.refresh();
    }
  }, [state?.message, router]);

  const isDirty =
    street !== initialStreet ||
    city !== initialCity ||
    stateField !== initialState ||
    postalCode !== initialPostalCode ||
    country !== initialCountry;

  const handleCancel = () => {
    setStreet(initialStreet);
    setCity(initialCity);
    setStateField(initialState);
    setPostalCode(initialPostalCode);
    setCountry(initialCountry);
  };

  return (
    <>
      <Title as='h1'>Shipping address</Title>
      <Note>Set the default address used for deliveries.</Note>

      {state?.message && (
        <p role='alert' style={{ color: 'green', marginTop: 8 }}>
          {state.message}
        </p>
      )}

      <Form action={formAction}>
        <FormFieldWrapper label='Street' required error={state?.errors?.street?.[0]}>
          <Input
            name='street'
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder='Street name and house number'
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='City' required error={state?.errors?.city?.[0]}>
          <Input name='city' value={city} onChange={(e) => setCity(e.target.value)} placeholder='City' />
        </FormFieldWrapper>

        <FormFieldWrapper label='State / region' error={state?.errors?.state?.[0]}>
          <Input
            name='state'
            value={stateField}
            onChange={(e) => setStateField(e.target.value)}
            placeholder='State / region (optional)'
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Postal code' required error={state?.errors?.postalCode?.[0]}>
          <Input
            name='postalCode'
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder='Postal code'
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Country (2-letter code)' required error={state?.errors?.country?.[0]}>
          <Input
            name='country'
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            placeholder='HU'
            maxLength={2}
          />
        </FormFieldWrapper>

        <FormButtonRow>
          <Button type='submit' disabled={pending || !isDirty}>
            {pending ? 'Saving…' : 'Save address'}
          </Button>
          <Button type='button' onClick={handleCancel} disabled={pending}>
            Cancel
          </Button>
        </FormButtonRow>
      </Form>
    </>
  );
}
