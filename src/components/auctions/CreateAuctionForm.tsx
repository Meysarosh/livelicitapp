'use client';

import { useActionState, useMemo, useState } from 'react';
import { createAuction } from '@/app/actions/createAuction';
import { Form, FormField } from '@/components/forms/form.styles';
import { Button, Input, Title, Note, TextArea, Select } from '@/components/ui';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/constants';
import type { CreateAuctionFormState } from '@/services/zodValidation-service';

export default function CreateAuctionForm() {
  const [state, action, pending] = useActionState<CreateAuctionFormState, FormData>(createAuction, undefined);

  const startModeOptions = useMemo(
    () => [
      { value: 'now', label: 'Start now' },
      { value: 'future', label: 'Schedule for later' },
    ],
    [],
  );

  const durationOptions = useMemo(
    () => [
      { value: '1', label: '1 day' },
      { value: '3', label: '3 days' },
      { value: '5', label: '5 days' },
      { value: '7', label: '7 days' },
      { value: 'test', label: 'Test (1 minute)' },
    ],
    [],
  );

  const currencyOptions = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map((currency) => ({
        value: currency,
        label: currency,
      })),
    [],
  );

  const [startMode, setStartMode] = useState<'now' | 'future'>(state?.values?.startMode ?? 'now');

  const [minStartAt] = useState(() => {
    const now = new Date();
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    return iso;
  });

  return (
    <>
      <Title>Create auction</Title>

      {state?.message && (
        <Note role='alert' aria-live='polite'>
          {state.message}
        </Note>
      )}

      <Form action={action}>
        {/* Title */}
        <FormField>
          <Input
            label='Title'
            id='title'
            name='title'
            required
            defaultValue={state?.values?.title ?? ''}
            error={state?.errors?.title?.[0]}
          />
        </FormField>

        {/* Description */}
        <FormField>
          <TextArea
            label='Description'
            id='description'
            name='description'
            required
            defaultValue={state?.values?.description ?? ''}
            error={state?.errors?.description?.[0]}
          />
        </FormField>

        {/* Image URLs */}
        <FormField>
          <TextArea
            label='Image URLs (one per line)'
            id='imageUrls'
            name='imageUrls'
            placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
            defaultValue={state?.values?.imageUrls ?? ''}
          />
        </FormField>

        {/* Starting price */}
        <FormField>
          <Input
            label='Starting price'
            id='startingPrice'
            name='startingPrice'
            type='number'
            step='0.01'
            min={0}
            required
            defaultValue={state?.values?.startingPrice ?? ''}
            error={state?.errors?.startingPrice?.[0]}
          />
        </FormField>

        {/* Minimum increment */}
        <FormField>
          <Input
            label='Minimum increment'
            id='minIncrement'
            name='minIncrement'
            type='number'
            step='0.01'
            min={0}
            required
            defaultValue={state?.values?.minIncrement ?? ''}
            error={state?.errors?.minIncrement?.[0]}
          />
        </FormField>

        {/* Start mode: now / future */}
        <FormField>
          <Select
            label='Start'
            id='startMode'
            name='startMode'
            value={startMode}
            onChange={(e) => setStartMode(e.target.value as 'now' | 'future')}
            options={startModeOptions}
            error={state?.errors?.startMode?.[0]}
          />
        </FormField>

        {/* Start date/time (only when future) */}
        {startMode === 'future' && (
          <FormField>
            <Input
              label='Start date & time'
              id='startAt'
              name='startAt'
              type='datetime-local'
              min={minStartAt}
              required
              defaultValue={state?.values?.startAt ?? ''}
              error={state?.errors?.startAt?.[0]}
            />
          </FormField>
        )}

        {/* Duration in days */}
        <FormField>
          <Select
            label='Duration'
            id='durationDays'
            name='durationDays'
            defaultValue={state?.values?.durationDays ?? '7'}
            options={durationOptions}
            error={state?.errors?.durationDays?.[0]}
          />
        </FormField>

        {/* Currency */}
        <FormField>
          <Select
            label='Currency'
            id='currency'
            name='currency'
            required
            defaultValue={state?.values?.currency ?? DEFAULT_CURRENCY}
            options={currencyOptions}
            error={state?.errors?.currency?.[0]}
          />
        </FormField>

        <Button disabled={pending} type='submit'>
          {pending ? 'Creating…' : 'Create auction'}
        </Button>
      </Form>
    </>
  );
}
