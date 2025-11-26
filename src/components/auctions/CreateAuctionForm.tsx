'use client';

import { useActionState, useMemo, useState } from 'react';
import { auctionCreate } from '@/app/actions/auctionCreate';
import { Form } from '@/components/forms/form.styles';
import { Button, Title, Note } from '@/components/ui';
import { Input, TextArea, Select } from '@/components/ui';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/constants';
import type { CreateAuctionFormState } from '@/services/zodValidation-service';
import { FormFieldWrapper } from '../forms/FormFiieldWrapper';
import { isoToLocalForInput } from '@/services/format-service';

export default function CreateAuctionForm() {
  const [state, action, pending] = useActionState<CreateAuctionFormState, FormData>(auctionCreate, undefined);

  const startModeOptions = useMemo(
    () => [
      { value: 'now', label: 'Start now' },
      { value: 'future', label: 'Schedule for later' },
    ],
    []
  );

  const durationOptions = useMemo(
    () => [
      { value: '1', label: '1 day' },
      { value: '3', label: '3 days' },
      { value: '5', label: '5 days' },
      { value: '7', label: '7 days' },
      { value: 'test', label: 'Test (1 minute)' },
    ],
    []
  );

  const currencyOptions = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map((currency) => ({
        value: currency,
        label: currency,
      })),
    []
  );

  const [startMode, setStartMode] = useState<'now' | 'future'>(state?.values?.startMode ?? 'now');

  const [isoStartAt, setIsoStartAt] = useState(state?.values?.startAt ?? '');

  const initialLocalStartAt = useMemo(() => isoToLocalForInput(state?.values?.startAt), [state?.values?.startAt]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!val) {
      setIsoStartAt('');
      return;
    }

    const date = new Date(val);
    setIsoStartAt(date.toISOString());
  };

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
        <FormFieldWrapper label='Title' required error={state?.errors?.title?.[0]}>
          <Input name='title' type='text' defaultValue={state?.values?.title ?? ''} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Description' required error={state?.errors?.description?.[0]}>
          <TextArea name='description' defaultValue={state?.values?.description ?? ''} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Image URLs (one per line)' error={state?.errors?.imageUrls?.[0]}>
          <TextArea
            name='imageUrls'
            placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
            defaultValue={state?.values?.imageUrls ?? ''}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Starting price' required error={state?.errors?.startingPrice?.[0]}>
          <Input
            name='startingPrice'
            type='number'
            step='0.01'
            min={0}
            defaultValue={state?.values?.startingPrice ?? ''}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Minimum increment' required error={state?.errors?.minIncrement?.[0]}>
          <Input
            name='minIncrement'
            type='number'
            step='0.01'
            min={0}
            defaultValue={state?.values?.minIncrement ?? ''}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Start' error={state?.errors?.startMode?.[0]}>
          <Select
            name='startMode'
            value={startMode}
            onChange={(e) => setStartMode(e.target.value as 'now' | 'future')}
            options={startModeOptions}
          />
        </FormFieldWrapper>

        {startMode === 'future' && (
          <FormFieldWrapper label='Start date & time' required error={state?.errors?.startAt?.[0]}>
            <Input
              type='datetime-local'
              min={minStartAt}
              defaultValue={initialLocalStartAt}
              onChange={handleDateChange}
            />
            <input type='hidden' name='startAt' value={isoStartAt} />
          </FormFieldWrapper>
        )}

        <FormFieldWrapper label='Duration' required error={state?.errors?.durationDays?.[0]}>
          <Select name='durationDays' defaultValue={state?.values?.durationDays ?? '7'} options={durationOptions} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Currency' required error={state?.errors?.currency?.[0]}>
          <Select
            name='currency'
            defaultValue={state?.values?.currency ?? DEFAULT_CURRENCY}
            options={currencyOptions}
          />
        </FormFieldWrapper>

        <Button disabled={pending} type='submit'>
          {pending ? 'Creating…' : 'Create auction'}
        </Button>
      </Form>
    </>
  );
}
