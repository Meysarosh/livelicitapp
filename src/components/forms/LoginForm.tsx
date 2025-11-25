'use client';

import { login } from '@/app/actions/login';
import { signIn } from 'next-auth/react';
import { Form, FormField, Summary, SCLink } from './form.styles';
import { Button, Input, Title, Note } from '@/components/ui';
import { useActionState, useEffect, useRef } from 'react';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state?.message) alertRef.current?.focus();
  }, [state?.message]);

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
          <Input
            label='Email'
            id='identifier'
            name='identifier'
            type='text'
            placeholder='you@example.com'
            autoComplete='email'
            required
            defaultValue={state?.values?.identifier ?? ''}
          />
        </FormField>
        <FormField>
          <Input
            label='Password'
            id='password'
            name='password'
            type='password'
            autoComplete='current-password'
            required
          />
        </FormField>

        <Button disabled={pending} type='submit'>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </Form>

      <Note>
        New here? <SCLink href='/register'>Create an account</SCLink>
      </Note>

      <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
        <span>or</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type='button'
          onClick={() =>
            signIn('auth0', {
              callbackUrl: '/account/auctions',
            })
          }
        >
          Continue with Auth0
        </Button>
      </div>
    </>
  );
}
