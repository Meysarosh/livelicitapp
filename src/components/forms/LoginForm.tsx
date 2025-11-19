'use client';

import { login } from '@/app/actions/login';

import { Title, Btn, Form, FormField, Label, Input, Summary, Note, SCLink } from './form.styles';
import { useActionState, useEffect, useRef } from 'react';

function fieldIds(base: string) {
  return { inputId: base, labelId: `${base}-label` } as const;
}

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state?.message) alertRef.current?.focus();
  }, [state?.message]);

  const identifierIds = fieldIds('identifier');
  const pwIds = fieldIds('password');

  return (
    <>
      <Title>Log in</Title>

      {state?.message && (
        <Summary ref={alertRef} tabIndex={-1} role='alert' aria-live='polite'>
          {state.message}
        </Summary>
      )}

      <Form action={action}>
        <FormField>
          <Label id={identifierIds.labelId} htmlFor={identifierIds.inputId}>
            Email
          </Label>
          <Input
            id={identifierIds.inputId}
            name='identifier'
            type='text'
            placeholder='you@example.com'
            autoComplete='email'
            required
            defaultValue={state?.values?.identifier ?? ''}
            aria-labelledby={identifierIds.labelId}
          />
        </FormField>
        <FormField>
          <Label id={pwIds.labelId} htmlFor={pwIds.inputId}>
            Password
          </Label>
          <Input
            id={pwIds.inputId}
            name='password'
            type='password'
            autoComplete='current-password'
            required
            aria-labelledby={pwIds.labelId}
          />
        </FormField>

        <Btn disabled={pending} type='submit'>
          {pending ? 'Signing in…' : 'Sign in'}
        </Btn>
      </Form>

      <Note>
        New here? <SCLink href='/register'>Create an account</SCLink>
      </Note>
    </>
  );
}
