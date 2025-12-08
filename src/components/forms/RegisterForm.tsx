'use client';

import { useActionState, useEffect, useRef } from 'react';

import { registerUser } from '@/app/actions/auth/registerUser';
import { buildErrorSummary } from '@/services/errorSummary-service';
import { SCLink, Summary, SummaryList, RequiredMark, Form } from './form.styles';
import { Button, Title, SubTitle, Note } from '@/components/ui';
import { Input } from '@/components/ui';
import { FormFieldWrapper } from './FormFieldWrapper';

type RegisterField = 'nickname' | 'email' | 'password' | 'confirmPassword';

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, undefined);

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

  const requiredNoteId = 'required-note';

  return (
    <>
      <Title>Sign Up</Title>

      {errors.length > 0 && (
        <Summary ref={summaryRef} tabIndex={-1} role='alert' aria-labelledby='error-summary-title'>
          <SubTitle id='error-summary-title'>Please fix the following:</SubTitle>
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
        <FormFieldWrapper label='Nickname' required error={state?.errors?.nickname?.[0]}>
          <Input
            name='nickname'
            type='text'
            placeholder='Your nickname'
            autoComplete='nickname'
            defaultValue={state?.values?.nickname ?? ''}
            aria-describedby={requiredNoteId}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Email' required error={state?.errors?.email?.[0]}>
          <Input
            name='email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            defaultValue={state?.values?.email ?? ''}
            aria-describedby={requiredNoteId}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Password' required error={state?.errors?.password?.[0]}>
          <Input name='password' type='password' autoComplete='new-password' aria-describedby={requiredNoteId} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Confirm password' required error={state?.errors?.confirmPassword?.[0]}>
          <Input name='confirmPassword' type='password' autoComplete='new-password' aria-describedby={requiredNoteId} />
        </FormFieldWrapper>

        <Button disabled={pending} type='submit'>
          {pending ? 'Creating…' : 'Create account'}
        </Button>
      </Form>

      <Note>
        Already have an account? <SCLink href='/login'>Log in</SCLink>
      </Note>
    </>
  );
}
