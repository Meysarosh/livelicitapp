'use client';

import { useActionState, useEffect, useRef } from 'react';

import { register } from '@/app/actions/register';
import { buildErrorSummary } from '@/lib/formValidation/errorSummary';
import {
  SCLink,
  Title,
  Summary,
  SummaryTitle,
  SummaryList,
  RequiredMark,
  Form,
  FormField,
  Label,
  Input,
  ErrorText,
  Btn,
  Note,
} from './form.styles';

type RegisterField = 'nickname' | 'email' | 'password' | 'confirmPassword';

function fieldIds(base: string) {
  return {
    inputId: base,
    errorId: `${base}-err`,
    hintId: `${base}-hint`,
    labelId: `${base}-label`,
  } as const;
}

function describedByIds(opts: { error?: string; hint?: string }) {
  const ids = [opts.hint, opts.error].filter(Boolean).join(' ');
  return ids.length ? ids : undefined;
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  const errors = buildErrorSummary<RegisterField>({
    errors: state?.errors as Partial<Record<RegisterField, string[]>> | undefined,
    message: state?.message,
    fieldMap: {
      nickname: { label: 'Nickname', inputId: 'nickname' },
      email: { label: 'Email', inputId: 'email' },
      password: { label: 'Password', inputId: 'password' },
      confirmPassword: { label: 'Confirm password', inputId: 'confirmPassword' },
    } as const,
    fallbackInputId: 'email',
  });

  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length) summaryRef.current?.focus();
  }, [errors.length]);

  const nicknameIds = fieldIds('nickname');
  const emailIds = fieldIds('email');
  const pwIds = fieldIds('password');
  const cpwIds = fieldIds('confirmPassword');
  const requiredNoteId = 'required-note';

  return (
    <>
      <Title>Sign Up</Title>

      {errors.length > 0 && (
        <Summary ref={summaryRef} tabIndex={-1} role='alert' aria-labelledby='error-summary-title'>
          <SummaryTitle id='error-summary-title'>Please fix the following:</SummaryTitle>
          <SummaryList>
            {errors.map((el, i) => (
              <li key={`${el.inputId}-${i}`}>
                <a href={`#${el.inputId}`}>
                  {el.field}: {el.message}
                </a>
              </li>
            ))}
          </SummaryList>
        </Summary>
      )}

      <Note id={requiredNoteId}>
        <RequiredMark aria-hidden='true'>*</RequiredMark> indicates a required field.
      </Note>

      <Form action={action} aria-describedby={requiredNoteId}>
        {/* Nickname */}
        <FormField>
          <Label id={nicknameIds.labelId} htmlFor={nicknameIds.inputId}>
            Name<RequiredMark aria-hidden='true'>*</RequiredMark>
          </Label>
          <Input
            id={nicknameIds.inputId}
            name='nickname'
            placeholder='Your nickname'
            autoComplete='nickname'
            required
            defaultValue={state?.values?.nickname ?? ''}
            aria-labelledby={nicknameIds.labelId}
            aria-invalid={!!state?.errors?.nickname}
            aria-describedby={describedByIds({
              hint: requiredNoteId,
              error: state?.errors?.nickname ? nicknameIds.errorId : undefined,
            })}
          />
          {state?.errors?.nickname && <ErrorText id={nicknameIds.errorId}>{state.errors.nickname[0]}</ErrorText>}
        </FormField>

        {/* Email */}
        <FormField>
          <Label id={emailIds.labelId} htmlFor={emailIds.inputId}>
            Email<RequiredMark aria-hidden='true'>*</RequiredMark>
          </Label>
          <Input
            id={emailIds.inputId}
            name='email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            required
            defaultValue={state?.values?.email ?? ''}
            aria-labelledby={emailIds.labelId}
            aria-invalid={!!state?.errors?.email}
            aria-describedby={describedByIds({
              hint: requiredNoteId,
              error: state?.errors?.email ? emailIds.errorId : undefined,
            })}
          />
          {state?.errors?.email && <ErrorText id={emailIds.errorId}>{state.errors.email[0]}</ErrorText>}
        </FormField>

        {/* Password */}
        <FormField>
          <Label id={pwIds.labelId} htmlFor={pwIds.inputId}>
            Password<RequiredMark aria-hidden='true'>*</RequiredMark>
          </Label>
          <Input
            id={pwIds.inputId}
            name='password'
            type='password'
            autoComplete='new-password'
            required
            aria-labelledby={pwIds.labelId}
            aria-invalid={!!state?.errors?.password}
            aria-describedby={describedByIds({
              hint: requiredNoteId,
              error: state?.errors?.password ? pwIds.errorId : undefined,
            })}
          />
          {state?.errors?.password && <ErrorText id={pwIds.errorId}>{state.errors.password[0]}</ErrorText>}
        </FormField>

        {/* Confirm Password */}
        <FormField>
          <Label id={cpwIds.labelId} htmlFor={cpwIds.inputId}>
            Confirm password<RequiredMark aria-hidden='true'>*</RequiredMark>
          </Label>
          <Input
            id={cpwIds.inputId}
            name='confirmPassword'
            type='password'
            autoComplete='new-password'
            required
            aria-labelledby={cpwIds.labelId}
            aria-invalid={!!state?.errors?.confirmPassword}
            aria-describedby={describedByIds({
              hint: requiredNoteId,
              error: state?.errors?.confirmPassword ? cpwIds.errorId : undefined,
            })}
          />
          {state?.errors?.confirmPassword && (
            <ErrorText id={cpwIds.errorId}>{state.errors.confirmPassword[0]}</ErrorText>
          )}
        </FormField>

        <Btn disabled={pending} type='submit'>
          {pending ? 'Creating…' : 'Create account'}
        </Btn>
      </Form>

      <Note>
        Already have an account? <SCLink href='/auth/login'>Log in</SCLink>
      </Note>
    </>
  );
}
