'use client';

import { useActionState, useState } from 'react';
import { createAuction } from '@/app/actions/createAuction';
import { Title, Form, FormField, Label, Input, Textarea, Btn, ErrorText, Note } from '@/components/forms/form.styles';
import type { CreateAuctionFormState } from '@/lib/formValidation/validation';

function fieldIds(base: string) {
  return {
    inputId: base,
    errorId: `${base}-err`,
    labelId: `${base}-label`,
  } as const;
}

export default function CreateAuctionForm() {
  const [state, action, pending] = useActionState<CreateAuctionFormState, FormData>(createAuction, undefined);

  const [startMode, setStartMode] = useState<'now' | 'future'>(state?.values?.startMode ?? 'now');

  const [minStartAt] = useState(() => {
    const now = new Date();
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    return iso;
  });

  const titleIds = fieldIds('title');
  const descriptionIds = fieldIds('description');
  const startingPriceIds = fieldIds('startingPrice');
  const minIncrementIds = fieldIds('minIncrement');
  const startModeIds = fieldIds('startMode');
  const startAtIds = fieldIds('startAt');
  const durationDaysIds = fieldIds('durationDays');
  const currencyIds = fieldIds('currency');
  const imageUrlsIds = fieldIds('imageUrls');

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
          <Label id={titleIds.labelId} htmlFor={titleIds.inputId}>
            Title
          </Label>
          <Input
            id={titleIds.inputId}
            name='title'
            required
            defaultValue={state?.values?.title ?? ''}
            aria-labelledby={titleIds.labelId}
            aria-invalid={!!state?.errors?.title}
          />
          {state?.errors?.title && <ErrorText id={titleIds.errorId}>{state.errors.title[0]}</ErrorText>}
        </FormField>

        {/* Description */}
        <FormField>
          <Label id={descriptionIds.labelId} htmlFor={descriptionIds.inputId}>
            Description
          </Label>
          <Textarea
            id={descriptionIds.inputId}
            name='description'
            required
            defaultValue={state?.values?.description ?? ''}
            aria-labelledby={descriptionIds.labelId}
            aria-invalid={!!state?.errors?.description}
          />
          {state?.errors?.description && (
            <ErrorText id={descriptionIds.errorId}>{state.errors.description[0]}</ErrorText>
          )}
        </FormField>

        {/* Image URLs */}
        <FormField>
          <Label id={imageUrlsIds.labelId} htmlFor={imageUrlsIds.inputId}>
            Image URLs (one per line)
          </Label>
          <Textarea
            id={imageUrlsIds.inputId}
            name='imageUrls'
            placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
            defaultValue={state?.values?.imageUrls ?? ''}
            aria-labelledby={imageUrlsIds.labelId}
          />
        </FormField>

        {/* Starting price */}
        <FormField>
          <Label id={startingPriceIds.labelId} htmlFor={startingPriceIds.inputId}>
            Starting price
          </Label>
          <Input
            id={startingPriceIds.inputId}
            name='startingPrice'
            type='number'
            step='0.01'
            min={0}
            required
            defaultValue={state?.values?.startingPrice ?? ''}
            aria-labelledby={startingPriceIds.labelId}
            aria-invalid={!!state?.errors?.startingPrice}
          />
          {state?.errors?.startingPrice && (
            <ErrorText id={startingPriceIds.errorId}>{state.errors.startingPrice[0]}</ErrorText>
          )}
        </FormField>

        {/* Minimum increment */}
        <FormField>
          <Label id={minIncrementIds.labelId} htmlFor={minIncrementIds.inputId}>
            Minimum increment
          </Label>
          <Input
            id={minIncrementIds.inputId}
            name='minIncrement'
            type='number'
            step='0.01'
            min={0}
            required
            defaultValue={state?.values?.minIncrement ?? ''}
            aria-labelledby={minIncrementIds.labelId}
            aria-invalid={!!state?.errors?.minIncrement}
          />
          {state?.errors?.minIncrement && (
            <ErrorText id={minIncrementIds.errorId}>{state.errors.minIncrement[0]}</ErrorText>
          )}
        </FormField>

        {/* Start mode: now / future */}
        <FormField>
          <Label id={startModeIds.labelId} htmlFor={startModeIds.inputId}>
            Start
          </Label>
          <select
            id={startModeIds.inputId}
            name='startMode'
            value={startMode}
            onChange={(e) => setStartMode(e.target.value as 'now' | 'future')}
            aria-labelledby={startModeIds.labelId}
            aria-invalid={!!state?.errors?.startMode}
          >
            <option value='now'>Start now</option>
            <option value='future'>Schedule for later</option>
          </select>
          {state?.errors?.startMode && <ErrorText id={startModeIds.errorId}>{state.errors.startMode[0]}</ErrorText>}
        </FormField>

        {/* Start date/time (only when future) */}
        {startMode === 'future' && (
          <FormField>
            <Label id={startAtIds.labelId} htmlFor={startAtIds.inputId}>
              Start date &amp; time
            </Label>
            <Input
              id={startAtIds.inputId}
              name='startAt'
              type='datetime-local'
              min={minStartAt}
              required
              defaultValue={state?.values?.startAt ?? ''}
              aria-labelledby={startAtIds.labelId}
              aria-invalid={!!state?.errors?.startAt}
            />
            {state?.errors?.startAt && <ErrorText id={startAtIds.errorId}>{state.errors.startAt[0]}</ErrorText>}
          </FormField>
        )}

        {/* Duration in days */}
        <FormField>
          <Label id={durationDaysIds.labelId} htmlFor={durationDaysIds.inputId}>
            Duration
          </Label>
          <select
            id={durationDaysIds.inputId}
            name='durationDays'
            defaultValue={state?.values?.durationDays ?? '7'}
            aria-labelledby={durationDaysIds.labelId}
            aria-invalid={!!state?.errors?.durationDays}
          >
            <option value='1'>1 day</option>
            <option value='3'>3 days</option>
            <option value='5'>5 days</option>
            <option value='7'>7 days</option>
            <option value='test'>Test (1 minute)</option>
          </select>
          {state?.errors?.durationDays && (
            <ErrorText id={durationDaysIds.errorId}>{state.errors.durationDays[0]}</ErrorText>
          )}
        </FormField>

        {/* Currency */}
        <FormField>
          <Label id={currencyIds.labelId} htmlFor={currencyIds.inputId}>
            Currency
          </Label>
          <Input
            id={currencyIds.inputId}
            name='currency'
            defaultValue={state?.values?.currency ?? 'HUF'}
            aria-labelledby={currencyIds.labelId}
            aria-invalid={!!state?.errors?.currency}
          />
          {state?.errors?.currency && <ErrorText id={currencyIds.errorId}>{state.errors.currency[0]}</ErrorText>}
        </FormField>

        <Btn disabled={pending} type='submit'>
          {pending ? 'Creating…' : 'Create auction'}
        </Btn>
      </Form>
    </>
  );
}
